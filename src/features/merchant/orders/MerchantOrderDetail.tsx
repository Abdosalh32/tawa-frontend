import { useEffect, useState } from 'react'
import './order-detail.css'
import {
  Alert,
  AppShell,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  KeyValueList,
  PageHeader,
  Radio,
  Skeleton,
  Stepper,
  Table,
  Toast,
  Topbar,
} from '../../../components/ui'
import { PAYMENT_METHODS, grandTotalOf } from '../../../types/checkout'
import { FULFILLMENT_STATUS, ORDER_FLOW, ORDER_STATUS, PAYMENT_STATUS } from '../../../types/status'
import type { OrderStatus } from '../../../types/status'
import { useNavigate, useParams } from 'react-router'
import { MerchantBreadcrumbs } from '../MerchantBreadcrumbs'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import { ORDER_DETAIL, itemsSubtotal, lineTotal } from './order-detail-mock-data'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'not-found' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'not-found', label: 'طلب غير موجود' },
  { value: 'error', label: 'خطأ' },
]

const FLOW_STEPS = ORDER_FLOW.map((key) => ({ key, label: ORDER_STATUS[key].label }))

function formatAmount(value: number): string {
  return `${value} د.ل`
}

function OrderDetailBody() {
  /* حالة الطلب محلية بالكامل — معاينة انتقالات 1.5.4 فقط، لا تحديث فعلياً */
  const [status, setStatus] = useState<OrderStatus>(ORDER_DETAIL.initialStatus)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const cancelled = status === 'cancelled'
  const flowIndex = cancelled ? -1 : ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number])
  const nextStatus = !cancelled && flowIndex >= 0 && flowIndex < ORDER_FLOW.length - 1 ? ORDER_FLOW[flowIndex + 1] : null
  /* الإلغاء متاح قبل التسليم — «من أي الحالات يجوز؟» سؤال مفتوح موثق (F4) */
  const cancellable = !cancelled && status !== 'delivered'

  const subtotal = itemsSubtotal(ORDER_DETAIL.items)
  const grandTotal = grandTotalOf(subtotal, ORDER_DETAIL.shippingFee)

  const advance = () => {
    if (!nextStatus) return
    setStatus(nextStatus)
    setToast(`حالة الطلب الآن: ${ORDER_STATUS[nextStatus].label} (معاينة محلية — لا تحديث فعلياً)`)
  }

  return (
    <>
      {cancelled && (
        <Alert variant="info" title="أُلغي هذا الطلب (معاينة محلية)">
          إرجاع الكميات المخصومة إلى المخزون يتم آلياً (1.5.5) — التنفيذ الفعلي مع الربط الخلفي، ولم تتغير بيانات المخزون التجريبية.
        </Alert>
      )}

      <section className="odet-card" aria-labelledby="odet-flow-title">
        <h2 id="odet-flow-title">مسار الحالة</h2>
        <div className="odet-flow">
          <Stepper steps={FLOW_STEPS} currentKey={cancelled ? '' : status} muted={cancelled} label="مسار حالة الطلب" />
          {nextStatus && (
            <Button variant="primary" onClick={advance}>
              نقل إلى: {ORDER_STATUS[nextStatus].label}
            </Button>
          )}
        </div>
        <p className="odet-summary-note">
          الانتقال خطي للأمام فقط: مؤكد ← قيد التجهيز ← جاهز للتسليم ← مسلّم (1.5.4) — معاينة محلية بلا أي تحديث فعلي.
        </p>
      </section>

      <div className="odet-columns">
        <div className="odet-main">
          <section className="odet-card" aria-labelledby="odet-items-title">
            <h2 id="odet-items-title">عناصر الطلب</h2>
            <Table caption="عناصر الطلب TW-2481-9X — بيانات تجريبية">
              <thead>
                <tr>
                  <th scope="col">المنتج</th>
                  <th scope="col">سعر الوحدة</th>
                  <th scope="col">الكمية</th>
                  <th scope="col">إجمالي السطر</th>
                </tr>
              </thead>
              <tbody>
                {ORDER_DETAIL.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="odet-item">
                        <span className="odet-item__name">{item.product}</span>
                        <span className="odet-item__meta">
                          {item.variant && <>{item.variant} — </>}
                          <span className="ltr">{item.sku}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="numeric">{formatAmount(item.unitPrice)}</span>
                    </td>
                    <td>
                      <span className="numeric">{item.quantity}</span>
                    </td>
                    <td>
                      <span className="numeric">{formatAmount(lineTotal(item))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </section>

          <section className="odet-card" aria-labelledby="odet-summary-title">
            <h2 id="odet-summary-title">ملخص الطلب</h2>
            <div>
              <p className="odet-summary-row">
                <span className="odet-summary-row__label">مجموع المنتجات</span>
                <span className="numeric">{formatAmount(subtotal)}</span>
              </p>
              <p className="odet-summary-row">
                <span className="odet-summary-row__label">رسوم الشحن</span>
                <span className="numeric">{formatAmount(ORDER_DETAIL.shippingFee)}</span>
              </p>
              <p className="odet-summary-row odet-summary-row--total">
                <span className="odet-summary-row__label">الإجمالي</span>
                <span className="numeric">{formatAmount(grandTotal)}</span>
              </p>
            </div>
            <p className="odet-summary-note">
              تُحتسب رسوم الشحن آلياً عبر شركة التوصيل عند تأكيد الطلب — الإجمالي = المنتجات + الشحن − الخصم.
            </p>
          </section>
        </div>

        <div className="odet-side">
          <section className="odet-card" aria-labelledby="odet-customer-title">
            <h2 id="odet-customer-title">بيانات العميل</h2>
            <KeyValueList
              items={[
                { label: 'الاسم', value: ORDER_DETAIL.customer.name },
                { label: 'رقم الهاتف', value: ORDER_DETAIL.customer.phone, ltr: true },
                { label: 'مكان الاستلام', value: ORDER_DETAIL.pickupLocation },
              ]}
            />
          </section>

          <section className="odet-card" aria-labelledby="odet-address-title">
            <h2 id="odet-address-title">عنوان الشحن</h2>
            <KeyValueList
              items={[
                { label: 'المدينة', value: ORDER_DETAIL.address.city },
                { label: 'العنوان التفصيلي', value: ORDER_DETAIL.address.details },
                /* رقم البوليصة الذي تتعقب به شركة التوصيل — والزبون يتتبع به بلا حساب */
                { label: 'رقم التتبع', value: ORDER_DETAIL.trackingNumber, ltr: true },
              ]}
            />
          </section>

          <section className="odet-card" aria-labelledby="odet-payment-title">
            <h2 id="odet-payment-title">الدفع</h2>
            <KeyValueList
              items={[
                { label: 'الوسيلة', value: PAYMENT_METHODS[ORDER_DETAIL.paymentMethod].label },
                {
                  label: 'حالة الدفع',
                  value: <Badge variant={PAYMENT_STATUS[ORDER_DETAIL.payment].variant}>{PAYMENT_STATUS[ORDER_DETAIL.payment].label}</Badge>,
                },
                ...(ORDER_DETAIL.paymentTransactionId
                  ? [{ label: 'رقم المعاملة', value: ORDER_DETAIL.paymentTransactionId, ltr: true }]
                  : []),
                {
                  label: 'حالة التجهيز',
                  value: (
                    <Badge variant={FULFILLMENT_STATUS[ORDER_DETAIL.fulfillment].variant}>
                      {FULFILLMENT_STATUS[ORDER_DETAIL.fulfillment].label}
                    </Badge>
                  ),
                },
              ]}
            />
          </section>

          {cancellable && (
            <section className="odet-card" aria-labelledby="odet-danger-title">
              <h2 id="odet-danger-title">إلغاء الطلب</h2>
              <p className="odet-summary-note">الإلغاء يعيد الكميات المخصومة للمخزون آلياً (1.5.5)</p>
              <div>
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  إلغاء الطلب
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        title={`إلغاء الطلب ${ORDER_DETAIL.id}`}
        impact="سيُلغى الطلب نهائياً وسيُرجع النظام الكميات المخصومة إلى المخزون تلقائياً — الإرجاع الفعلي يتم مع الربط الخلفي (معاينة محلية)."
        confirmLabel="إلغاء الطلب"
        requireReason
        reasonLabel="سبب الإلغاء"
        onConfirm={() => {
          setCancelOpen(false)
          setStatus('cancelled')
          setToast('أُلغي الطلب (معاينة محلية — لا تحديث فعلياً)')
        }}
        onCancel={() => setCancelOpen(false)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </>
  )
}

function LoadingBody() {
  return (
    <div className="odet-columns" aria-hidden="true">
      <div className="odet-main">
        <Skeleton variant="rect" height={88} />
        <Skeleton variant="rect" height={220} />
        <Skeleton variant="rect" height={160} />
      </div>
      <div className="odet-side">
        <Skeleton variant="rect" height={150} />
        <Skeleton variant="rect" height={120} />
        <Skeleton variant="rect" height={120} />
      </div>
    </div>
  )
}

export function MerchantOrderDetail() {
  const [view, setView] = useState<ScreenView>('normal')
  /* الطلب يخصّ متجراً واحداً (D5) — معرفه من العنوان، والمجهول أو التابع لمتجر آخر
     يقابل 404 من /stores/{id}/orders/{order} */
  const { orderId } = useParams()
  const navigate = useNavigate()
  const store = useActiveStore()
  const orderFound = store.hasSeedData && orderId === ORDER_DETAIL.id
  const effectiveView: ScreenView = view === 'normal' && !orderFound ? 'not-found' : view

  return (
    <AppShell
      context="merchant"
      className="odet-shell"
      sidebar={<MerchantSidebar active="orders" />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title={`الطلب ${ORDER_DETAIL.id}`}
        description={`أُنشئ ${ORDER_DETAIL.createdAt} — ${ORDER_DETAIL.items.length} عناصر`}
        breadcrumbs={<MerchantBreadcrumbs items={[{ label: 'الرئيسية', to: 'overview' }, { label: 'الطلبات', to: 'orders' }, { label: 'تفاصيل الطلب' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="odet-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {effectiveView === 'normal' ? (
        <OrderDetailBody key="normal" />
      ) : effectiveView === 'loading' ? (
        <LoadingBody />
      ) : effectiveView === 'not-found' ? (
        <div className="odet-card">
          <EmptyState
            title="الطلب غير موجود أو غير متاح"
            description={
              store.hasSeedData
                ? `لا طلب بالمعرف «${orderId ?? ''}» في هذا المتجر — تأكد من الرقم، فقد يكون الرابط قديماً. (المعاينة المحلية تعرض الطلب ${ORDER_DETAIL.id} فقط)`
                : `هذا الطلب لا يخصّ «${store.name}» — كل طلب يتبع المتجر الذي أُنشئ فيه.`
            }
            action={<Button variant="secondary" onClick={() => navigate(`/merchant/${store.id}/orders`)}>العودة إلى الطلبات</Button>}
          />
        </div>
      ) : (
        <div className="odet-card">
          <ErrorState description="تعذّر جلب تفاصيل الطلب — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      )}
    </AppShell>
  )
}
