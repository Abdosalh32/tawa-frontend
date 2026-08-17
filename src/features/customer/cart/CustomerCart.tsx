import { useEffect, useMemo, useState } from 'react'
import './cart.css'
import { Badge, Button, EmptyState, ErrorState, Input, Radio, Skeleton, Toast } from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { DISCOUNT_MESSAGE, describeDiscountValue, evaluateDiscount } from '../../../types/discount'
import { StorefrontShell } from '../storefront/StorefrontShell'
import { STORE_DISCOUNT_CODES } from '../storefront/mock-data'
import {
  applyPreviewDiscount,
  clearPreviewDiscount,
  removeCartLine,
  resetPreviewCart,
  setCartLineQuantity,
  useStorePreviewConfig,
} from '../storefront/preview-config'

/** حالة عرض تطويرية محلية — الافتراضي «سلة ببنود» (المعاينات لا تمسح بيانات السلة المشتركة) */
type ScreenView = 'normal' | 'empty' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'سلة ببنود (الافتراضية)' },
  { value: 'empty', label: 'سلة فارغة (معاينة — لا تمسح البيانات)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

function formatPrice(value: number): string {
  return `${value} د.ل`
}

function RemoveGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

export function CustomerCart() {
  const [view, setView] = useState<ScreenView>('normal')
  const [toast, setToast] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState<string | undefined>()
  const { lines, discount } = useStorePreviewConfig()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  /* مجموع المنتجات وعدد العناصر مشتقان محلياً (2.2.4) */
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0), [lines])
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines])

  const shownLines = view === 'empty' ? [] : lines
  const isEmpty = shownLines.length === 0

  /** التحقق محلي بدلالات الـ schema — يقوم مقام مسار validate حتى الربط */
  const applyCode = () => {
    const result = evaluateDiscount(codeInput, subtotal, STORE_DISCOUNT_CODES)
    if (result.status === 'ok') {
      applyPreviewDiscount({ code: result.rule.code, amount: result.amount, rule: result.rule })
      setCodeError(undefined)
      setCodeInput('')
      setToast(`طُبّق كود «${result.rule.code}» — وفّرت ${result.amount} د.ل (معاينة محلية)`)
      return
    }
    if (result.status === 'min_not_met') {
      setCodeError(`${DISCOUNT_MESSAGE.min_not_met} (${result.minOrderAmount} د.ل)`)
      return
    }
    setCodeError(DISCOUNT_MESSAGE[result.status])
  }

  const removeCode = () => {
    clearPreviewDiscount()
    setCodeError(undefined)
    setToast('أُزيل كود الخصم')
  }

  const removeLine = (id: string, name: string) => {
    removeCartLine(id)
    setToast(`أُزيل «${name}» من السلة (معاينة محلية)`)
  }

  return (
    <StorefrontShell
      devStateControls={
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — حالة الشاشة (السلة محلية بلا حفظ؛ المعاينات لا تمسح بياناتها)</legend>
          <div className="dev-fieldset__options">
            {VIEW_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="crt-view"
                label={option.label}
                checked={view === option.value}
                onChange={() => setView(option.value)}
              />
            ))}
            <Button variant="secondary" size="sm" onClick={() => {
              resetPreviewCart()
              setView('normal')
              setToast('أُعيدت تعبئة سلة المعاينة (بيانات تجريبية)')
            }}>
              إعادة تعبئة سلة المعاينة
            </Button>
          </div>
        </fieldset>
      }
    >
      <main className="crt-main">
        <h1 className="crt-title">سلة التسوق</h1>

        {view === 'loading' ? (
          <>
            <div style={{ display: 'grid', gap: 'var(--space-md)' }} aria-hidden="true">
              <Skeleton variant="rect" height={88} />
              <Skeleton variant="rect" height={88} />
            </div>
            <Skeleton variant="rect" height={260} />
          </>
        ) : view === 'error' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorState
              description="تعذّر تحميل سلتك — تحقق من اتصالك ثم أعد المحاولة."
              onRetry={() => setView('normal')}
            />
          </div>
        ) : isEmpty ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              title="سلتك فارغة"
              description="أضف منتجات من المتجر لتظهر هنا مع الكميات والإجمالي."
              action={
                <button type="button" className="crt-continue">
                  متابعة التسوق
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="crt-lines">
              {shownLines.map((line) => {
                const atCap = line.maxQuantity !== undefined && line.quantity >= line.maxQuantity
                return (
                  <article className="crt-line" key={line.id}>
                    {/* الصورة زخرفية — الاسم المجاور حامل المعنى */}
                    <span className="crt-line__img" aria-hidden="true">
                      <TagGlyph />
                    </span>
                    <div className="crt-line__info">
                      <p className="crt-line__name">{line.name}</p>
                      {line.variant && <p className="crt-line__variant">{line.variant}</p>}
                      <p className="crt-line__unit">
                        سعر الوحدة: <span className="numeric">{formatPrice(line.unitPrice)}</span>
                      </p>
                    </div>
                    <div className="crt-line__side">
                      <div className="crt-line__controls">
                        <div className="crt-qty" role="group" aria-label={`كمية ${line.name}`}>
                          <button
                            type="button"
                            className="crt-qty__btn"
                            aria-label={`إنقاص كمية ${line.name}`}
                            disabled={line.quantity <= 1}
                            onClick={() => setCartLineQuantity(line.id, line.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="crt-qty__value" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="crt-qty__btn"
                            aria-label={`زيادة كمية ${line.name}`}
                            disabled={atCap}
                            onClick={() => setCartLineQuantity(line.id, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="crt-remove"
                          aria-label={`حذف ${line.name} من السلة`}
                          onClick={() => removeLine(line.id, line.name)}
                        >
                          <RemoveGlyph />
                        </button>
                      </div>
                      <p className="crt-line__total">
                        <span className="numeric">{formatPrice(line.unitPrice * line.quantity)}</span>
                      </p>
                    </div>
                    {atCap && (
                      <p className="crt-line__cap">
                        الكمية المتاحة: <span className="numeric">{line.maxQuantity}</span> فقط
                      </p>
                    )}
                  </article>
                )
              })}
            </div>

            <aside className="crt-summary" aria-label="ملخص الطلب">
              <h2>ملخص الطلب</h2>
              <p className="crt-summary__row">
                <span>عدد العناصر</span>
                <span className="numeric">{itemCount}</span>
              </p>
              <p className="crt-summary__row crt-summary__row--strong">
                <span>مجموع المنتجات</span>
                <span className="numeric">{formatPrice(subtotal)}</span>
              </p>
              <p className="crt-summary__row">
                <span>رسوم الشحن</span>
                <Badge variant="neutral" dot={false}>
                  بانتظار قرار المنتج (D1)
                </Badge>
              </p>
              {discount ? (
                <>
                  <p className="crt-summary__row">
                    <span>
                      الخصم (<span className="ltr">{discount.code}</span>)
                    </span>
                    <span className="numeric crt-discount__amount">− {formatPrice(discount.amount)}</span>
                  </p>
                  <div className="crt-discount__applied">
                    <span>
                      {describeDiscountValue(discount.rule)} · الحد الأدنى <span className="numeric">{discount.rule.minOrderAmount} د.ل</span>
                    </span>
                    <Button variant="ghost" size="sm" onClick={removeCode}>
                      إزالة الكود
                    </Button>
                  </div>
                </>
              ) : (
                <div className="crt-discount">
                  <Input
                    label="كود الخصم"
                    optional
                    ltr
                    value={codeInput}
                    error={codeError}
                    onChange={(event) => {
                      setCodeInput(event.target.value.toUpperCase())
                      setCodeError(undefined)
                    }}
                  />
                  <Button variant="secondary" disabled={codeInput.trim() === ''} onClick={applyCode}>
                    تطبيق
                  </Button>
                </div>
              )}
              <p className="crt-summary__note">
                يكتمل الإجمالي النهائي بعد حسم آلية الشحن (D1) — الخصم يُطبَّق بالكود ويُحسم من مجموع المنتجات.
              </p>
              <button
                type="button"
                className="crt-checkout"
                onClick={() => setToast('خطوة الشحن والدفع تُبنى في مرحلة قادمة (معاينة محلية — لا طلب فعلياً)')}
              >
                إتمام الشراء
              </button>
            </aside>
          </>
        )}
      </main>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </StorefrontShell>
  )
}
