import { useMemo, useState } from 'react'
import { Badge, Button, Checkbox, EmptyState, ErrorState, Radio, SearchField, Skeleton } from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { StorefrontShell } from './StorefrontShell'
import { CATEGORIES, COLOR_SWATCHES, SIZE_OPTIONS, STOREFRONT_PRODUCTS } from './mock-data'
import type { StorefrontCategory } from './mock-data'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'متجر بلا منتجات منشورة' },
  { value: 'error', label: 'خطأ' },
]

function formatPrice(value: number): string {
  return `${value} د.ل`
}

export function CustomerStorefrontBrowse() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | StorefrontCategory>('all')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [selectedColors, setSelectedColors] = useState<ReadonlySet<string>>(new Set())
  const [selectedSizes, setSelectedSizes] = useState<ReadonlySet<string>>(new Set())

  const filtersActive =
    search.trim() !== '' || category !== 'all' || priceMin !== '' || priceMax !== '' || selectedColors.size > 0 || selectedSizes.size > 0

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setPriceMin('')
    setPriceMax('')
    setSelectedColors(new Set())
    setSelectedSizes(new Set())
  }

  /* البحث (2.1.2: العناوين والأصناف) والفلترة (2.1.3/2.1.4) محلية بالكامل */
  const filtered = useMemo(() => {
    const query = search.trim()
    const min = priceMin.trim() === '' ? null : Number(priceMin)
    const max = priceMax.trim() === '' ? null : Number(priceMax)
    return STOREFRONT_PRODUCTS.filter((product) => {
      const categoryLabel = CATEGORIES.find((c) => c.key === product.category)?.label ?? ''
      if (query && !product.name.includes(query) && !categoryLabel.includes(query)) return false
      if (category !== 'all' && product.category !== category) return false
      if (min !== null && Number.isFinite(min) && product.price < min) return false
      if (max !== null && Number.isFinite(max) && product.price > max) return false
      if (selectedColors.size > 0 && !(product.colors ?? []).some((color) => selectedColors.has(color))) return false
      if (selectedSizes.size > 0 && !(product.sizes ?? []).some((size) => selectedSizes.has(size))) return false
      return true
    })
  }, [search, category, priceMin, priceMax, selectedColors, selectedSizes])

  const toggleInSet = (set: ReadonlySet<string>, value: string): Set<string> => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const products = view === 'empty' ? [] : filtered

  return (
    <StorefrontShell
      headerMiddle={<SearchField label="ابحث في المتجر" placeholder="ابحث عن منتج…" value={search} onChange={setSearch} />}
      devStateControls={
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً)</legend>
          <div className="dev-fieldset__options">
            {VIEW_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                name="sf-view"
                label={option.label}
                checked={view === option.value}
                onChange={() => setView(option.value)}
              />
            ))}
          </div>
        </fieldset>
      }
    >
      <nav className="sf-cats" aria-label="تصنيفات المتجر">
        <button type="button" className="sf-cat" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
          الكل
        </button>
        {CATEGORIES.map((item) => (
          <button
            key={item.key}
            type="button"
            className="sf-cat"
            aria-pressed={category === item.key}
            onClick={() => setCategory(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="sf-main">
        {view === 'loading' ? (
          <>
            <Skeleton variant="rect" height={320} />
            <div className="sf-grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} variant="rect" height={220} />
              ))}
            </div>
          </>
        ) : view === 'error' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorState
              description="تعذّر تحميل منتجات المتجر — تحقق من اتصالك ثم أعد المحاولة."
              onRetry={() => setView('normal')}
            />
          </div>
        ) : (
          <>
            <aside className="sf-filters" aria-label="تصفية المنتجات">
              <h2>التصفية</h2>
              <div className="sf-filter-group">
                <p>السعر (د.ل)</p>
                <div className="sf-price-row">
                  <input
                    className="tw-control"
                    type="number"
                    min={0}
                    dir="ltr"
                    aria-label="حد السعر الأدنى بالدينار"
                    value={priceMin}
                    onChange={(event) => setPriceMin(event.target.value)}
                  />
                  <span aria-hidden="true">—</span>
                  <input
                    className="tw-control"
                    type="number"
                    min={0}
                    dir="ltr"
                    aria-label="حد السعر الأقصى بالدينار"
                    value={priceMax}
                    onChange={(event) => setPriceMax(event.target.value)}
                  />
                </div>
              </div>
              <div className="sf-filter-group">
                <p>اللون</p>
                {COLOR_SWATCHES.map((swatch) => (
                  <span className="sf-color-option" key={swatch.name}>
                    <span className="sf-color-dot" style={{ background: swatch.hex }} aria-hidden="true" />
                    <Checkbox
                      label={swatch.name}
                      checked={selectedColors.has(swatch.name)}
                      onChange={() => setSelectedColors((prev) => toggleInSet(prev, swatch.name))}
                    />
                  </span>
                ))}
              </div>
              <div className="sf-filter-group">
                <p>المقاس</p>
                <div className="sf-sizes">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className="sf-size"
                      aria-pressed={selectedSizes.has(size)}
                      onClick={() => setSelectedSizes((prev) => toggleInSet(prev, size))}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {filtersActive && (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </aside>

            <div className="sf-products">
              {view === 'normal' && products.length > 0 && (
                <div className="sf-hero">
                  <span className="sf-hero__title">أهلاً بكم في متجر العافية</span>
                  <span className="sf-hero__sub">منتجات أصلية وتوصيل لكل المدن — تسوقوا أحدث المنتجات</span>
                </div>
              )}

              {products.length === 0 ? (
                view === 'empty' ? (
                  <EmptyState
                    title="لا منتجات معروضة حالياً"
                    description="عندما ينشر المتجر منتجاته ستظهر هنا مباشرة."
                  />
                ) : (
                  <EmptyState
                    title="لا توجد منتجات مطابقة"
                    description="جرّب كلمات أخرى أو امسح الفلاتر."
                    action={
                      <Button variant="secondary" onClick={resetFilters}>
                        مسح الفلاتر
                      </Button>
                    }
                  />
                )
              ) : (
                <div className="sf-grid">
                  {products.map((product) => (
                    <article className="sf-card" key={product.id}>
                      {/* الصورة زخرفية — الاسم المجاور حامل المعنى */}
                      <span className="sf-card__img" aria-hidden="true">
                        <TagGlyph />
                      </span>
                      <div>
                        <p className="sf-card__name">{product.name}</p>
                        <p className="sf-card__price">
                          <span className="numeric">{formatPrice(product.price)}</span>
                        </p>
                      </div>
                      <div className="sf-card__meta">
                        {product.outOfStock && <Badge variant="error">نفد المخزون</Badge>}
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={product.outOfStock}
                          aria-label={`عرض المنتج ${product.name}`}
                        >
                          عرض المنتج
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </StorefrontShell>
  )
}
