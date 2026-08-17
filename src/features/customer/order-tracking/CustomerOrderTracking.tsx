import { useRef, useState } from 'react'
import './tracking.css'
import { Alert, Badge, ErrorState, Input, Radio, Skeleton } from '../../../components/ui'
import { ORDER_FLOW, ORDER_STATUS, PAYMENT_STATUS } from '../../../types/status'
import { StorefrontShell } from '../storefront/StorefrontShell'
import { TRACKED_ORDERS, findTrackedOrder } from './mock-data'
import type { TrackedOrder } from './mock-data'

/** المسار الخطي من الباكند (orders.order_status) لعرض الخط الزمني */
const FLOW = ORDER_FLOW

/** حالة عرض تطويرية محلية — الافتراضي «نموذج الاستعلام» */
type ScreenView = 'form' | 'active' | 'delivered' | 'cancelled' | 'not-found' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'form', label: 'نموذج الاستعلام (الافتراضي)' },
  { value: 'active', label: 'طلب نشط' },
  { value: 'delivered', label: 'طلب مسلّم' },
  { value: 'cancelled', label: 'طلب ملغى' },
  { value: 'not-found', label: 'طلب غير موجود' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

interface LookupErrors {
  orderId?: string
  phone?: string
}

interface TimelineStep {
  key: string
  label: string
  time?: string
  state: 'done' | 'current' | 'upcoming' | 'cancelled'
}

/** بناء خطوات الخط الزمني من حالة الطلب وأوقاته الموثقة */
function timelineOf(order: TrackedOrder): TimelineStep[] {
  if (order.status === 'cancelled') {
    const done = FLOW.filter((status) => order.times[status] !== undefined).map<TimelineStep>((status) => ({
      key: status,
      label: ORDER_STATUS[status].label,
      time: order.times[status],
      state: 'done',
    }))
    return [...done, { key: 'cancelled', label: ORDER_STATUS.cancelled.label, time: order.times.cancelled, state: 'cancelled' }]
  }
  const currentIndex = FLOW.indexOf(order.status as (typeof FLOW)[number])
  return FLOW.map<TimelineStep>((status, index) => ({
    key: status,
    label: ORDER_STATUS[status].label,
    time: order.times[status],
    state: index < currentIndex ? 'done' : index === currentIndex ? (status === 'delivered' ? 'done' : 'current') : 'upcoming',
  }))
}

function formatPrice(value: number): string {
  return `${value} د.ل`
}

export function CustomerOrderTracking() {
  const [view, setView] = useState<ScreenView>('form')
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<LookupErrors>({})
  const [result, setResult] = useState<TrackedOrder | null>(null)
  const [notFound, setNotFound] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const lookup = () => {
    const nextErrors: LookupErrors = {}
    if (orderId.trim() === '') nextErrors.orderId = 'أدخل رقم الطلب — تجده في رسالة التأكيد'
    const digits = phone.replace(/[\s-]/g, '')
    if (!/^\+?\d{9,15}$/.test(digits)) nextErrors.phone = 'أدخل رقم الهاتف المستخدم في الطلب'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setResult(null)
      setNotFound(false)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    /* المطابقة محلية بالرقمين معاً (2.2.8) — لا نداء شبكة */
    const match = findTrackedOrder(orderId, phone)
    setResult(match ?? null)
    setNotFound(match === undefined)
  }

  /** قفزة تطويرية: تعبئة النموذج وعرض نتيجة جاهزة */
  const jumpTo = (nextView: ScreenView) => {
    setView(nextView)
    setErrors({})
    if (nextView === 'active' || nextView === 'delivered' || nextView === 'cancelled') {
      const order = nextView === 'active' ? TRACKED_ORDERS[0] : nextView === 'delivered' ? TRACKED_ORDERS[1] : TRACKED_ORDERS[2]
      setOrderId(order.id)
      setPhone(order.phone)
      setResult(order)
      setNotFound(false)
    } else if (nextView === 'not-found') {
      setOrderId('TW-0000-0A')
      setPhone('+218900000000')
      setResult(null)
      setNotFound(true)
    } else {
      setOrderId('')
      setPhone('')
      setResult(null)
      setNotFound(false)
    }
  }

  const errorMessages = Object.values(errors)

  return (
    <StorefrontShell
      devStateControls={
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — حالة الشاشة (مطابقة محلية على بيانات تجريبية، لا استعلام فعلياً)</legend>
          <div className="dev-fieldset__options">
            {VIEW_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="ot-view"
                label={option.label}
                checked={view === option.value}
                onChange={() => jumpTo(option.value)}
              />
            ))}
          </div>
        </fieldset>
      }
    >
      <main className="ot-main">
        {view === 'loading' ? (
          <div className="ot-card" aria-hidden="true">
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="rect" height={48} />
            <Skeleton variant="rect" height={48} />
            <Skeleton variant="rect" height={44} />
          </div>
        ) : view === 'error' ? (
          <div className="ot-card">
            <ErrorState
              description="تعذّر فتح صفحة التتبع — تحقق من اتصالك ثم أعد المحاولة."
              onRetry={() => jumpTo('form')}
            />
          </div>
        ) : (
          <>
            <form
              className="ot-card"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                lookup()
              }}
            >
              <h1 className="ot-title">تتبع طلبك</h1>
              <p className="ot-help">
                أدخل رقم الطلب ورقم الهاتف المستخدم فيه لعرض حالة شحنتك — دون حساب (2.2.8). تجد رقم الطلب في رسالة
                التأكيد.
              </p>

              {errorMessages.length > 0 && (
                <div ref={summaryRef} tabIndex={-1}>
                  <Alert variant="error" title="راجع الحقلين">
                    <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
                      {errorMessages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </Alert>
                </div>
              )}

              <Input
                label="رقم الطلب"
                ltr
                helperText="مثال: TW-2481-9X"
                value={orderId}
                error={errors.orderId}
                onChange={(event) => setOrderId(event.target.value)}
              />
              <Input
                label="رقم الهاتف المستخدم في الطلب"
                type="tel"
                value={phone}
                error={errors.phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <button type="submit" className="ot-submit">
                تتبع
              </button>

              {notFound && (
                <Alert variant="error" title="لا يوجد طلب مطابق">
                  تأكد من رقم الطلب ورقم الهاتف معاً — يجب أن يطابقا بيانات الطلب نفسه.
                </Alert>
              )}
            </form>

            {result && (
              <section className="ot-card" aria-label="نتيجة التتبع">
                <div className="ot-result-head">
                  <p className="ot-result-head__id numeric">{result.id}</p>
                  <p className="ot-result-head__meta">
                    {result.storeName} — أُنشئ {result.createdAt}
                  </p>
                  <div>
                    <Badge variant={ORDER_STATUS[result.status].variant}>{ORDER_STATUS[result.status].label}</Badge>
                  </div>
                </div>

                {result.status === 'cancelled' && (
                  <Alert variant="info" title="أُلغي هذا الطلب">
                    لأي استفسار عن طلبك تواصل مع المتجر مباشرة.
                  </Alert>
                )}

                <ol className="ot-timeline">
                  {timelineOf(result).map((step) => (
                    <li key={step.key} className={`ot-step ot-step--${step.state}`} aria-current={step.state === 'current' ? 'step' : undefined}>
                      <span className="ot-step__marker" aria-hidden="true">
                        {step.state === 'done' ? '✓' : step.state === 'cancelled' ? '✕' : '•'}
                      </span>
                      <span className="ot-step__body">
                        <span className="ot-step__label">
                          {step.label}
                          <span className="visually-hidden">
                            {step.state === 'done' ? ' (مكتملة)' : step.state === 'current' ? ' (الحالة الحالية)' : step.state === 'upcoming' ? ' (بانتظار)' : ''}
                          </span>
                        </span>
                        {step.time && <span className="ot-step__time">{step.time}</span>}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="ot-summary">
                  <p className="ot-summary__row">
                    <span>عدد العناصر</span>
                    <span className="numeric">{result.itemCount}</span>
                  </p>
                  <p className="ot-summary__row">
                    <span>مجموع المنتجات</span>
                    <span className="numeric">{formatPrice(result.productsSubtotal)}</span>
                  </p>
                  <p className="ot-summary__row">
                    <span>طريقة الدفع</span>
                    <span>
                      {result.paymentMethod} <Badge variant={PAYMENT_STATUS[result.payment].variant}>{PAYMENT_STATUS[result.payment].label}</Badge>
                    </span>
                  </p>
                  <p className="ot-summary__row">
                    <span>مكان الاستلام</span>
                    <span>{result.pickupLocation}</span>
                  </p>
                  <p className="ot-summary__note">
                    يُعرض مجموع المنتجات فقط — الإجمالي النهائي يكتمل بعد حسم آلية الشحن (D1) وآلية الخصم (D9).
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </StorefrontShell>
  )
}
