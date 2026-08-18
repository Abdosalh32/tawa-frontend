import { useEffect, useState } from 'react'
import './product-detail.css'
import { useNavigate, useParams } from 'react-router'
import { Badge, Breadcrumbs, Button, EmptyState, ErrorState, Radio, Skeleton, Toast } from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { StorefrontShell } from '../storefront/StorefrontShell'
import { addCartLine } from '../storefront/preview-config'
import { OUT_PRODUCT, SIMPLE_PRODUCT, VARIANT_PRODUCT, comboFor, optionAvailable } from './mock-data'
import type { DetailProduct } from './mock-data'

/** حالة عرض تطويرية محلية — الافتراضي «منتج متوفر» */
type ScreenView = 'simple' | 'variants' | 'out' | 'loading' | 'not-found' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'simple', label: 'منتج متوفر (الافتراضي)' },
  { value: 'variants', label: 'منتج بمتغيرات مطلوبة' },
  { value: 'out', label: 'منتج نفد' },
  { value: 'loading', label: 'تحميل' },
  { value: 'not-found', label: 'منتج غير موجود' },
  { value: 'error', label: 'خطأ' },
]

function formatPrice(value: number): string {
  return `${value} د.ل`
}

function ProductBody({ product }: { product: DetailProduct }) {
  const navigate = useNavigate()
  const hasVariants = (product.axes?.length ?? 0) > 0
  const [size, setSize] = useState<string | undefined>()
  const [type, setType] = useState<string | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const selectedCombo = hasVariants ? comboFor(product, size, type) : undefined
  const selectionComplete = !hasVariants || (size !== undefined && type !== undefined)

  /* السعر والتوفر المعروضان يتبعان التركيبة المختارة (1.4.7) */
  const price = selectedCombo?.price ?? product.price
  const availability = hasVariants ? (selectionComplete ? (selectedCombo?.availability ?? 'out') : null) : product.availability
  const remaining = hasVariants ? selectedCombo?.remaining : product.remaining

  /* سقف الكمية عند انخفاض المتبقي المعلن (نمط 2.2.2: «المتاح X فقط») */
  const maxQuantity = availability === 'low' && remaining !== undefined ? remaining : null
  const clampedNote = maxQuantity !== null && quantity >= maxQuantity

  const canAdd = availability !== null && availability !== 'out' && selectionComplete

  const changeQuantity = (delta: number) => {
    setQuantity((current) => {
      const next = current + delta
      if (next < 1) return 1
      if (maxQuantity !== null && next > maxQuantity) return maxQuantity
      return next
    })
  }

  const addToCart = () => {
    if (!canAdd) return
    addCartLine({
      id: [product.id, size ?? '', type ?? ''].filter(Boolean).join('|'),
      name: product.name,
      variant: hasVariants ? [size, type].filter(Boolean).join(' / ') : undefined,
      unitPrice: price,
      quantity,
      maxQuantity: availability === 'low' ? remaining : undefined,
    })
    setToast(`أُضيف إلى السلة (${quantity}×) — معاينة محلية، لا حفظ فعلياً`)
  }

  const selectAxis = (axis: 'size' | 'type', value: string) => {
    if (axis === 'size') setSize(value)
    else setType(value)
    setQuantity(1)
  }

  return (
    <main className="pd-main">
      <div className="pd-breadcrumbs-row">
        {/* التصنيف يقود للتصفح — تصفية التصنيف في العنوان تُبنى مع ربط الـ API */}
        <Breadcrumbs
          items={[
            { label: 'الرئيسية', onSelect: () => navigate('/shop') },
            { label: product.categoryLabel, onSelect: () => navigate('/shop') },
            { label: product.name },
          ]}
        />
      </div>

      <div className="pd-gallery">
        {/* الصور زخرفية — اسم المنتج المجاور حامل المعنى */}
        <span className="pd-gallery__main" aria-hidden="true">
          <TagGlyph />
        </span>
        <div className="pd-gallery__thumbs">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              type="button"
              className="pd-thumb"
              aria-label={`عرض الصورة ${index + 1}`}
              aria-pressed={activeThumb === index}
              onClick={() => setActiveThumb(index)}
            />
          ))}
        </div>
      </div>

      <div className="pd-info">
        <div>
          <p className="pd-category">{product.categoryLabel}</p>
          <h1 className="pd-name">{product.name}</h1>
          <p className="pd-short">{product.shortDescription}</p>
        </div>

        <p className="pd-price">
          <span className="numeric">{formatPrice(price)}</span>
          {/* السعر قبل الخصم — للمنتج بلا متغيرات فقط (كل تركيبة لها سعرها) */}
          {!hasVariants && product.compareAtPrice !== undefined && (
            <>
              {' '}
              <span className="pd-compare numeric">{formatPrice(product.compareAtPrice)}</span>
            </>
          )}
        </p>

        <div className="pd-availability">
          {availability === null ? (
            <span className="pd-hint">اختر الحجم والنوع لعرض التوفر والسعر النهائي</span>
          ) : availability === 'out' ? (
            <Badge variant="error">غير متوفر</Badge>
          ) : availability === 'low' ? (
            <>
              <Badge variant="warning">متوفر — كمية محدودة</Badge>
              {remaining !== undefined && (
                <span>
                  تبقى <span className="numeric">{remaining}</span> قطع فقط
                </span>
              )}
            </>
          ) : (
            <Badge variant="success">متوفر</Badge>
          )}
        </div>

        {product.axes?.map((axis) => {
          const selected = axis.key === 'size' ? size : type
          const otherValue = axis.key === 'size' ? type : size
          return (
            <div className="pd-axis" key={axis.key} role="group" aria-label={axis.label}>
              <p>{axis.label}</p>
              <div className="pd-options">
                {axis.options.map((option) => {
                  const available = optionAvailable(product, axis.key, option, otherValue)
                  return (
                    <button
                      key={option}
                      type="button"
                      className="pd-option"
                      aria-pressed={selected === option}
                      disabled={!available}
                      onClick={() => selectAxis(axis.key, option)}
                    >
                      {option}
                      {!available && <span className="visually-hidden"> (غير متوفر)</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="pd-buybar">
          <div className="pd-qty" role="group" aria-label="الكمية">
            <button type="button" className="pd-qty__btn" aria-label="إنقاص الكمية" disabled={quantity <= 1} onClick={() => changeQuantity(-1)}>
              −
            </button>
            <span className="pd-qty__value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="pd-qty__btn"
              aria-label="زيادة الكمية"
              disabled={maxQuantity !== null && quantity >= maxQuantity}
              onClick={() => changeQuantity(1)}
            >
              +
            </button>
          </div>
          <button type="button" className="pd-add" disabled={!canAdd} onClick={addToCart}>
            {availability === 'out' ? 'غير متوفر' : 'أضف إلى السلة'}
          </button>
          {clampedNote && (
            <span className="pd-hint">
              الكمية المتاحة: <span className="numeric">{maxQuantity}</span> فقط
            </span>
          )}
          {!selectionComplete && <span className="pd-hint">أكمل اختيار الخيارات لتفعيل الإضافة</span>}
        </div>

        <div className="pd-accordions">
          <details className="pd-acc" open>
            <summary>الوصف الكامل</summary>
            <div>{product.longDescription}</div>
          </details>
          <details className="pd-acc">
            <summary>سياسة الاسترجاع</summary>
            <div>تُعرض سياسات المتجر هنا — قائمة السياسات الإلزامية قرار منتج معلّق (G1).</div>
          </details>
          <details className="pd-acc">
            <summary>معلومات الشحن</summary>
            <div>
              تُحتسب رسوم الشحن عند إتمام الشراء بحسب شركة التوصيل ومدينتك — يظهر الرقم النهائي في ملخص الطلب قبل
              التأكيد.
            </div>
          </details>
        </div>
      </div>

      {toast && (
        <Toast
          variant="success"
          message={toast}
          floating
          action={
            <Button variant="ghost" size="sm" style={{ color: 'var(--accent-soft)' }}>
              إتمام الشراء
            </Button>
          }
          onClose={() => setToast(null)}
        />
      )}
    </main>
  )
}

/** معرف العنوان ← المنتج التجريبي المطابق (متسق مع معرفات شاشة التصفح) */
const PRODUCT_VIEW_OF: Record<string, ScreenView> = { c3: 'simple', c1: 'variants', p1: 'out' }
const PRODUCT_URL_OF: Partial<Record<ScreenView, string>> = {
  simple: '/shop/products/c3',
  variants: '/shop/products/c1',
  out: '/shop/products/p1',
  'not-found': '/shop/products/unknown',
}

export function CustomerProductDetail() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [view, setView] = useState<ScreenView>('simple')
  /* المنتج من معرف العنوان — والمجهول «غير موجود»؛ حالتا التحميل والخطأ أدوات معاينة محلية */
  const paramView: ScreenView = PRODUCT_VIEW_OF[productId ?? ''] ?? 'not-found'
  const effectiveView: ScreenView = view === 'loading' || view === 'error' ? view : paramView

  return (
    <StorefrontShell
      devStateControls={
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — حالة الصفحة (اختيار منتج ينتقل لعنوانه الفعلي)</legend>
          <div className="dev-fieldset__options">
            {VIEW_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="pd-view"
                label={option.label}
                checked={effectiveView === option.value}
                onChange={() => {
                  const url = PRODUCT_URL_OF[option.value]
                  if (url) {
                    setView('simple')
                    navigate(url)
                  } else {
                    setView(option.value)
                  }
                }}
              />
            ))}
          </div>
        </fieldset>
      }
    >
      {effectiveView === 'loading' ? (
        <main className="pd-main" aria-hidden="true">
          <Skeleton variant="rect" height={420} />
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rect" height={56} />
            <Skeleton variant="rect" height={220} />
          </div>
        </main>
      ) : effectiveView === 'not-found' ? (
        <main className="pd-main">
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              title="المنتج غير موجود أو لم يعد متاحاً"
              description="ربما أُرشف المنتج أو تغيّر رابطه — تصفح بقية منتجات المتجر."
              action={<Button variant="secondary" onClick={() => navigate('/shop')}>العودة للتصفح</Button>}
            />
          </div>
        </main>
      ) : effectiveView === 'error' ? (
        <main className="pd-main">
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorState
              description="تعذّر تحميل المنتج — تحقق من اتصالك ثم أعد المحاولة."
              onRetry={() => setView('simple')}
            />
          </div>
        </main>
      ) : (
        <ProductBody
          key={effectiveView}
          product={effectiveView === 'variants' ? VARIANT_PRODUCT : effectiveView === 'out' ? OUT_PRODUCT : SIMPLE_PRODUCT}
        />
      )}
    </StorefrontShell>
  )
}
