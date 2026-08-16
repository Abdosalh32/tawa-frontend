import { useEffect, useMemo, useRef, useState } from 'react'
import './checkout.css'
import { Alert, Badge, Button, EmptyState, ErrorState, Input, Radio, Select, Skeleton, Stepper, Textarea, Toast } from '../../../components/ui'
import { StorefrontShell } from '../storefront/StorefrontShell'
import { useStorePreviewConfig } from '../storefront/preview-config'
import { CITIES, MOCK_TRACKING_ID, PICKUP_OPTIONS, emptyCheckout, validateCheckout } from './checkout-data'
import type { CheckoutErrors, CheckoutFormState } from './checkout-data'

/** خطوات الشراء الموثقة (برومت 14): السلة ← الشحن والدفع ← التأكيد */
const STEPS = [
  { key: 'cart', label: 'السلة' },
  { key: 'shipping', label: 'الشحن والدفع' },
  { key: 'confirm', label: 'التأكيد' },
] as const

/** حالة عرض تطويرية محلية — الافتراضي «إتمام ببنود» */
type ScreenView = 'normal' | 'empty' | 'loading' | 'error' | 'success'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'إتمام ببنود (الافتراضية)' },
  { value: 'empty', label: 'سلة فارغة (معاينة — لا تمسح البيانات)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
  { value: 'success', label: 'نجاح التأكيد المحلي' },
]

function formatPrice(value: number): string {
  return `${value} د.ل`
}

function CheckGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 15l6 6L23 8" />
    </svg>
  )
}

export function CustomerCheckout() {
  const [view, setView] = useState<ScreenView>('normal')
  const [form, setForm] = useState<CheckoutFormState>(emptyCheckout)
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const { lines } = useStorePreviewConfig()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [lines])
  const shownLines = view === 'empty' ? [] : lines
  const cartEmpty = shownLines.length === 0

  const confirmOrder = () => {
    if (cartEmpty) return
    const nextErrors = validateCheckout(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setView('success')
    setToast('تم التأكيد محلياً — لا طلب ولا دفع فعلياً')
  }

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_TRACKING_ID)
      setToast('نُسخ رقم التتبع')
    } catch {
      setToast('تعذّر النسخ — انسخ الرقم يدوياً')
    }
  }

  const errorMessages = Object.values(errors)

  return (
    <StorefrontShell
      devStateControls={
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — حالة الشاشة (لا طلب ولا دفع فعلياً؛ المعاينات لا تمسح بيانات السلة)</legend>
          <div className="dev-fieldset__options">
            {VIEW_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="co-view"
                label={option.label}
                checked={view === option.value}
                onChange={() => setView(option.value)}
              />
            ))}
            <Button variant="secondary" size="sm" onClick={confirmOrder}>
              إظهار أخطاء التحقق
            </Button>
          </div>
        </fieldset>
      }
    >
      <main className="co-main">
        <div className="co-head">
          <h1 className="co-title">إتمام الشراء</h1>
          <Stepper steps={STEPS} currentKey={view === 'success' ? 'confirm' : 'shipping'} label="خطوات الشراء" />
        </div>

        {view === 'loading' ? (
          <>
            <div style={{ display: 'grid', gap: 'var(--space-lg)' }} aria-hidden="true">
              <Skeleton variant="rect" height={280} />
              <Skeleton variant="rect" height={160} />
            </div>
            <Skeleton variant="rect" height={300} />
          </>
        ) : view === 'error' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorState
              description="تعذّر تحميل بيانات الإتمام — تحقق من اتصالك ثم أعد المحاولة."
              onRetry={() => setView('normal')}
            />
          </div>
        ) : view === 'success' ? (
          <div className="co-success">
            <span className="co-success__icon" aria-hidden="true">
              <CheckGlyph />
            </span>
            <h2>تم استلام طلبك!</h2>
            <p className="co-summary__note">رقم التتبع الفريد لطلبك — احتفظ به لتتبع طلبك مع رقم هاتفك دون حساب (2.2.8)</p>
            <p className="co-success__id numeric">{MOCK_TRACKING_ID}</p>
            <div className="co-success__actions">
              <Button variant="secondary" onClick={copyTrackingId}>
                نسخ الرقم
              </Button>
              <button type="button" className="co-outline-btn">
                تتبع الطلب
              </button>
              <button type="button" className="co-outline-btn">
                مواصلة التسوق
              </button>
            </div>
            <Alert variant="info" title="معاينة محلية فقط">
              لم يُنشأ طلب ولم يُنفَّذ دفع ولم يُرسل أي شيء للخادم — رقم التتبع أعلاه هو المعرّف التجريبي الموثق، وسلة
              المعاينة لم تُفرَّغ.
            </Alert>
          </div>
        ) : cartEmpty ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              title="سلتك فارغة — لا يمكن إتمام الشراء"
              description="أضف منتجات إلى سلتك أولاً ثم عد لإتمام الشراء."
              action={
                <button type="button" className="co-outline-btn">
                  متابعة التسوق
                </button>
              }
            />
          </div>
        ) : (
          <>
            <form
              className="co-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                confirmOrder()
              }}
            >
              {errorMessages.length > 0 && (
                <div ref={summaryRef} tabIndex={-1}>
                  <Alert variant="error" title="راجع الحقول التالية">
                    <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
                      {errorMessages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </Alert>
                </div>
              )}

              <section className="co-card" aria-labelledby="co-shipping-title">
                <h2 id="co-shipping-title">بيانات الشحن والاستلام</h2>
                <Input
                  label="الاسم"
                  autoComplete="name"
                  value={form.name}
                  error={errors.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
                <Input
                  label="رقم الهاتف"
                  type="tel"
                  autoComplete="tel"
                  helperText="يُستخدم مع رقم الطلب لتتبع شحنتك دون حساب"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
                <Select
                  label="المدينة"
                  value={form.city}
                  error={errors.city}
                  onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                >
                  <option value="">اختر مدينتك…</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
                <Input
                  label="العنوان التفصيلي"
                  value={form.address}
                  error={errors.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
                <Textarea
                  label="ملاحظات الطلب"
                  optional
                  rows={3}
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <div>
                  <p className="tw-field__label" style={{ marginBlockEnd: 'var(--space-sm)' }}>
                    مكان الاستلام
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                    {PICKUP_OPTIONS.map((option) => (
                      <Radio
                        key={option.value}
                        name="co-pickup"
                        label={option.label}
                        checked={form.pickup === option.value}
                        onChange={() => setForm((prev) => ({ ...prev, pickup: option.value }))}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <section className="co-card" aria-labelledby="co-payment-title">
                <h2 id="co-payment-title">طريقة الدفع</h2>
                <div className="co-payments" role="radiogroup" aria-label="اختيار طريقة الدفع">
                  <label className="co-pay">
                    <input
                      type="radio"
                      className="visually-hidden"
                      name="co-payment"
                      checked={form.payment === 'cod'}
                      onChange={() => setForm((prev) => ({ ...prev, payment: 'cod' }))}
                    />
                    <span className="co-pay__card">
                      <span className="co-pay__name">كاش عند الاستلام</span>
                      <span className="co-pay__hint">ادفع نقداً عند استلام شحنتك (2.2.7)</span>
                    </span>
                  </label>
                  <label className="co-pay">
                    {/* البطاقة موثقة (2.2.7) لكن تكامل الدفع معلّق (D2) — خيار معطّل لا نموذج بطاقة */}
                    <input type="radio" className="visually-hidden" name="co-payment" disabled checked={false} readOnly />
                    <span className="co-pay__card">
                      <span className="co-pay__name">
                        بطاقة مصرفية{' '}
                        <Badge variant="warning" dot={false}>
                          غير متاح — D2
                        </Badge>
                      </span>
                      <span className="co-pay__hint">
                        يُفعَّل الدفع بالبطاقة بعد تأكيد تكامل بوابة الدفع وسلوك المعاملات — لا نعرض نموذج بطاقة قبل ذلك.
                      </span>
                    </span>
                  </label>
                </div>
              </section>
            </form>

            <aside className="co-summary" aria-label="مراجعة الطلب">
              <h2>مراجعة الطلب</h2>
              {shownLines.map((line) => (
                <div className="co-summary__line" key={line.id}>
                  <span className="co-summary__line-info">
                    <span>
                      {line.name} <span className="numeric">×{line.quantity}</span>
                    </span>
                    {line.variant && <span className="co-summary__variant">{line.variant}</span>}
                  </span>
                  <span className="numeric">{formatPrice(line.unitPrice * line.quantity)}</span>
                </div>
              ))}
              {form.notes.trim() !== '' && (
                <p className="co-summary__note">ملاحظات الطلب: {form.notes.trim()}</p>
              )}
              <p className="co-summary__row co-summary__row--strong">
                <span>مجموع المنتجات</span>
                <span className="numeric">{formatPrice(subtotal)}</span>
              </p>
              <p className="co-summary__row">
                <span>رسوم الشحن</span>
                <Badge variant="neutral" dot={false}>
                  بانتظار قرار المنتج (D1)
                </Badge>
              </p>
              <p className="co-summary__row">
                <span>الخصم</span>
                <Badge variant="neutral" dot={false}>
                  بانتظار قرار المنتج (D9)
                </Badge>
              </p>
              <p className="co-summary__note">
                يكتمل الإجمالي النهائي بعد حسم آلية الشحن (D1) وآلية الخصم (D9) — لا نعرض إجمالياً مفترضاً.
              </p>
              <button type="button" className="co-confirm" disabled={cartEmpty} onClick={confirmOrder}>
                تأكيد الطلب
              </button>
              <p className="co-summary__note">تأكيد محلي للمعاينة — لا طلب ولا دفع ولا إرسال للخادم.</p>
            </aside>
          </>
        )}
      </main>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </StorefrontShell>
  )
}
