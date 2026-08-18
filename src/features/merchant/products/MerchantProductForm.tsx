import { useEffect, useId, useRef, useState } from 'react'
import './product-form.css'
import {
  Alert,
  AppShell,
  Badge,
  Button,
  IconButton,
  Input,
  PageHeader,
  Radio,
  Select,
  Switch,
  Table,
  Textarea,
  Toast,
  Topbar,
} from '../../../components/ui'
import { useNavigate } from 'react-router'
import { MerchantBreadcrumbs } from '../MerchantBreadcrumbs'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import { CATEGORY_OPTIONS, EDIT_MOCK_NET_STOCK, editMockForm, emptyForm, syncCombos } from './product-form-data'
import type { ProductFormState } from './product-form-data'
import { validateProductForm } from './product-form-validation'
import type { ValidationResult } from './product-form-validation'

type FormMode = 'create' | 'edit'

function RemoveGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l8 8M10 2L2 10" />
    </svg>
  )
}

/** محرر قيم محور واحد (المقاس أو اللون — المحوران الموثقان 1.4.6) */
function AxisEditor({
  label,
  values,
  onAdd,
  onRemove,
}: {
  label: string
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}) {
  const [draft, setDraft] = useState('')
  const id = useId()

  const commit = () => {
    onAdd(draft)
    setDraft('')
  }

  return (
    <div className="pform-axis">
      <label className="tw-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="pform-axis__row">
        <input
          id={id}
          className="tw-control pform-axis__input"
          value={draft}
          placeholder="أدخل قيمة"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
            }
          }}
        />
        <Button variant="secondary" size="sm" onClick={commit}>
          إضافة
        </Button>
        <span className="pform-chips">
          {values.map((value) => (
            <span className="pform-chip" key={value}>
              {value}
              <IconButton label={`حذف القيمة ${value} من ${label}`} size="sm" onClick={() => onRemove(value)}>
                <RemoveGlyph />
              </IconButton>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}

function ProductFormBody({ mode }: { mode: FormMode }) {
  const [form, setForm] = useState<ProductFormState>(() => (mode === 'edit' ? editMockForm() : emptyForm()))
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const errors = validation?.fieldErrors ?? {}
  const comboErrors = validation?.comboErrors ?? {}

  const addAxisValue = (axis: 'sizes' | 'colors', raw: string) => {
    const value = raw.trim()
    if (value === '') return
    setForm((prev) => {
      if (prev[axis].includes(value)) return prev
      const sizes = axis === 'sizes' ? [...prev.sizes, value] : prev.sizes
      const colors = axis === 'colors' ? [...prev.colors, value] : prev.colors
      return { ...prev, sizes, colors, combos: syncCombos(prev.combos, sizes, colors) }
    })
  }

  const removeAxisValue = (axis: 'sizes' | 'colors', value: string) => {
    setForm((prev) => {
      const sizes = axis === 'sizes' ? prev.sizes.filter((v) => v !== value) : prev.sizes
      const colors = axis === 'colors' ? prev.colors.filter((v) => v !== value) : prev.colors
      return { ...prev, sizes, colors, combos: syncCombos(prev.combos, sizes, colors) }
    })
  }

  const updateCombo = (key: string, patch: Partial<Pick<ProductFormState['combos'][number], 'price' | 'quantity' | 'sku' | 'removed'>>) => {
    setForm((prev) => ({
      ...prev,
      combos: prev.combos.map((combo) => (combo.key === key ? { ...combo, ...patch } : combo)),
    }))
  }

  /** الحفظ محلي بالكامل — لا استمرارية ولا نداء شبكة */
  const save = (asDraft: boolean) => {
    const candidate: ProductFormState = asDraft ? { ...form, status: 'draft' } : form
    const result = validateProductForm(candidate)
    setValidation(result)
    if (!result.valid) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setForm(candidate)
    setToast(asDraft ? 'تم حفظ المنتج كمسودة (معاينة محلية — لا حفظ فعلياً)' : 'تم حفظ المنتج (معاينة محلية — لا حفظ فعلياً)')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        save(false)
      }}
      noValidate
    >
      {validation && !validation.valid && (
        <div ref={summaryRef} tabIndex={-1} style={{ marginBlockEnd: 'var(--space-xl)' }}>
          <Alert variant="error" title="تعذّر الحفظ — راجع الحقول التالية">
            <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
              {validation.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <div className="pform-columns">
        <div className="pform-main">
          <section className="pform-card" aria-labelledby="pform-info-title">
            <h2 id="pform-info-title">معلومات المنتج</h2>
            <Input
              label="اسم المنتج"
              value={form.name}
              error={errors.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Textarea
              label="الوصف"
              optional
              helperText="وصف واضح يزيد ثقة المشتري"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Input
              label="رمز المنتج (SKU)"
              optional
              ltr
              value={form.sku}
              onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
            />
            <Select
              label="الفئة"
              helperText="مصدر قائمة التصنيفات قرار منتج معلّق (M5) — القائمة الحالية تجريبية"
              value={form.category}
              error={errors.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">اختر فئة…</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </section>

          <section className="pform-card" aria-labelledby="pform-media-title">
            <h2 id="pform-media-title">الصور</h2>
            <div className="pform-deferred">
              <Badge variant="warning">مؤجل — بانتظار قرار منتج</Badge>
              <p>
                صور المنتج مطلوبة في المتطلبات (1.4.2) لكن آلية الرفع تُبنى مع الربط الفعلي —
                هذا Placeholder موسوم عمداً ولا يقبل ملفات.
              </p>
            </div>
          </section>

          {!form.variantsEnabled && (
            <section className="pform-card" aria-labelledby="pform-pricing-title">
              <h2 id="pform-pricing-title">التسعير والمخزون</h2>
              <p className="pform-card__hint">تظهر هذه البطاقة للمنتج بلا متغيرات — مع المتغيرات يُسعَّر كل تركيبة على حدة (1.4.7)</p>
              <Input
                label="السعر (د.ل)"
                type="number"
                min={0}
                step="0.25"
                value={form.price}
                error={errors.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              />
              <Input
                label="الكمية المتاحة"
                type="number"
                min={0}
                step={1}
                value={form.quantity}
                error={errors.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              />
            </section>
          )}

          <section className="pform-card" aria-labelledby="pform-variants-title">
            <h2 id="pform-variants-title">المتغيرات</h2>
            <Switch
              label="هذا المنتج له خيارات متعددة (مقاس، لون…)"
              checked={form.variantsEnabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, variantsEnabled: checked }))}
            />
            {form.variantsEnabled && (
              <>
                <AxisEditor
                  label="قيم المقاس"
                  values={form.sizes}
                  onAdd={(value) => addAxisValue('sizes', value)}
                  onRemove={(value) => removeAxisValue('sizes', value)}
                />
                <AxisEditor
                  label="قيم اللون"
                  values={form.colors}
                  onAdd={(value) => addAxisValue('colors', value)}
                  onRemove={(value) => removeAxisValue('colors', value)}
                />
                {errors.variants && <p className="tw-field__error">{errors.variants}</p>}

                {form.combos.length > 0 && (
                  <Table caption="جدول تركيبات المتغيرات — يتولد تلقائياً من قيم المحاور">
                    <thead>
                      <tr>
                        <th scope="col">التركيبة</th>
                        <th scope="col">السعر (د.ل)</th>
                        <th scope="col">الكمية</th>
                        <th scope="col">SKU</th>
                        <th scope="col">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.combos.map((combo) => (
                        <tr key={combo.key} className={combo.removed ? 'is-removed' : undefined}>
                          <td>
                            <span className="pform-combo-label">{combo.label}</span>
                          </td>
                          <td>
                            <input
                              className="tw-control pform-combo-input"
                              type="number"
                              min={0}
                              step="0.25"
                              dir="ltr"
                              aria-label={`سعر التركيبة ${combo.label} بالدينار`}
                              aria-invalid={comboErrors[combo.key] ? true : undefined}
                              value={combo.price}
                              disabled={combo.removed}
                              onChange={(event) => updateCombo(combo.key, { price: event.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="tw-control pform-combo-input"
                              type="number"
                              min={0}
                              step={1}
                              dir="ltr"
                              aria-label={`كمية التركيبة ${combo.label}`}
                              aria-invalid={comboErrors[combo.key] ? true : undefined}
                              value={combo.quantity}
                              disabled={combo.removed}
                              onChange={(event) => updateCombo(combo.key, { quantity: event.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              className="tw-control pform-combo-input pform-combo-input--sku"
                              dir="ltr"
                              aria-label={`رمز SKU للتركيبة ${combo.label}`}
                              value={combo.sku}
                              disabled={combo.removed}
                              onChange={(event) => updateCombo(combo.key, { sku: event.target.value })}
                            />
                          </td>
                          <td>
                            {combo.removed ? (
                              <Button variant="secondary" size="sm" onClick={() => updateCombo(combo.key, { removed: false })}>
                                استعادة
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`حذف التركيبة ${combo.label} — قابل للتراجع قبل الحفظ`}
                                onClick={() => updateCombo(combo.key, { removed: true })}
                              >
                                حذف
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </>
            )}
          </section>
        </div>

        <div className="pform-side">
          <section className="pform-card" aria-labelledby="pform-status-title">
            <h2 id="pform-status-title">الحالة</h2>
            <Radio
              name="pform-status"
              label="منشور"
              description="يظهر للزبائن في واجهة المتجر"
              checked={form.status === 'active'}
              onChange={() => setForm((prev) => ({ ...prev, status: 'active' }))}
            />
            <Radio
              name="pform-status"
              label="مسودة"
              description="محفوظ في اللوحة فقط"
              checked={form.status === 'draft'}
              onChange={() => setForm((prev) => ({ ...prev, status: 'draft' }))}
            />
          </section>

          {mode === 'edit' && (
            <section className="pform-card" aria-labelledby="pform-net-title">
              <h2 id="pform-net-title">المخزون الصافي</h2>
              <div className="pform-net">
                <p className="pform-net__row">
                  <span>الكمية الكلية</span>
                  <span className="numeric">{EDIT_MOCK_NET_STOCK.total}</span>
                </p>
                <p className="pform-net__row">
                  <span>محجوز مؤقتاً (15 دقيقة لسلات نشطة)</span>
                  <span className="numeric">{EDIT_MOCK_NET_STOCK.reserved}</span>
                </p>
                <p className="pform-net__row pform-net__row--strong">
                  <span>المتاح للبيع</span>
                  <span className="numeric">{EDIT_MOCK_NET_STOCK.available}</span>
                </p>
              </div>
            </section>
          )}

          <section className="pform-card" aria-labelledby="pform-alert-title">
            <h2 id="pform-alert-title">تنبيه المخزون</h2>
            <Input
              label="نبّهني عندما تقل الكمية عن"
              optional
              type="number"
              min={0}
              step={1}
              helperText="دلالة الحد (لكل منتج أم عام) قرار معلّق — G4"
              value={form.lowStockThreshold}
              error={errors.lowStockThreshold}
              onChange={(event) => setForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))}
            />
          </section>
        </div>
      </div>

      <div className="pform-footer">
        <Button variant="primary" type="submit">
          حفظ المنتج
        </Button>
        <Button variant="secondary" onClick={() => save(true)}>
          حفظ كمسودة
        </Button>
        <Button variant="ghost">إلغاء</Button>
        <span className="pform-footer__note">معاينة تطويرية — لا حفظ فعلياً</span>
      </div>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </form>
  )
}

export function MerchantProductForm({ mode }: { mode: FormMode }) {
  /* الوضع من العنوان: /products/new أو /products/{id}/edit — لا حالة داخلية */
  const navigate = useNavigate()
  /* المنتج يتبع متجراً واحداً (D5) — لا منتج لتعديله في متجر بلا منتجات */
  const store = useActiveStore()
  const canEdit = store.hasSeedData
  const effectiveMode: FormMode = canEdit ? mode : 'create'

  return (
    <AppShell
      context="merchant"
      className="pform-shell"
      sidebar={<MerchantSidebar active="products" />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title={effectiveMode === 'create' ? 'إضافة منتج' : 'تعديل منتج'}
        description={effectiveMode === 'create' ? 'أدخل بيانات المنتج ومتغيراته — المنشور يظهر للزبائن فور الحفظ' : 'عدّل بيانات «قميص قطني رجالي» ومتغيراته ومخزونه'}
        breadcrumbs={
          <MerchantBreadcrumbs items={[{ label: 'الرئيسية', to: 'overview' }, { label: 'المنتجات', to: 'products' }, { label: effectiveMode === 'create' ? 'إضافة منتج' : 'تعديل منتج' }]} />
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — وضع النموذج (التبديل ينتقل بين مساري /new و/edit فعلياً)</legend>
        <div className="dev-fieldset__options">
          <Radio
            name="pform-mode"
            label="إضافة منتج"
            checked={effectiveMode === 'create'}
            onChange={() => navigate(`/merchant/${store.id}/products/new`)}
          />
          <Radio
            name="pform-mode"
            label="تعديل منتج (بيانات تجريبية)"
            description={canEdit ? undefined : `لا منتجات في «${store.name}» بعد — لا شيء لتعديله`}
            disabled={!canEdit}
            checked={effectiveMode === 'edit'}
            onChange={() => navigate(`/merchant/${store.id}/products/p2/edit`)}
          />
        </div>
      </fieldset>

      <ProductFormBody key={effectiveMode} mode={effectiveMode} />
    </AppShell>
  )
}
