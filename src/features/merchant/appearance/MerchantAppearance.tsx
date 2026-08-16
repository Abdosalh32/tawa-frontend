import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './appearance.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ErrorState,
  PageHeader,
  Radio,
  Sidebar,
  Skeleton,
  Toast,
  Topbar,
} from '../../../components/ui'
import { StoreBrand } from '../StoreBrand'
import { buildMerchantNav } from '../merchant-nav'
import {
  COLOR_ROLES,
  DEFAULT_COLORS,
  TEMPLATES,
  evaluateContrast,
  normalizeHex,
  readableOn,
} from './appearance-data'
import type { ColorRole, TemplateKey } from './appearance-data'

/** صف تحرير دور لوني: منتقٍ أصلي + حقل HEX بتحقق محلي */
function ColorRoleField({
  label,
  hint,
  value,
  draft,
  error,
  onPick,
  onHexChange,
}: {
  label: string
  hint: string
  value: string
  draft: string
  error?: string
  onPick: (hex: string) => void
  onHexChange: (raw: string) => void
}) {
  const id = useId()
  return (
    <div className="appr-role">
      <label className="tw-field__label" htmlFor={`${id}-picker`}>
        {label}
      </label>
      <div className="appr-role__row">
        <input
          id={`${id}-picker`}
          type="color"
          className="appr-role__picker"
          value={value}
          aria-label={`منتقي ${label}`}
          onChange={(event) => onPick(event.target.value)}
        />
        <input
          className="tw-control appr-role__hex ltr"
          dir="ltr"
          value={draft}
          aria-label={`قيمة HEX لـ${label}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onHexChange(event.target.value)}
        />
        <span className="appr-role__hint">{hint}</span>
      </div>
      {error && (
        <p className="tw-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

export function MerchantAppearance() {
  const [view, setView] = useState<ScreenView>('normal')
  const [template, setTemplate] = useState<TemplateKey>('modern')
  /** معاينة قالب غير مثبت (برومت 9: «تثبيت» و«معاينة» زران منفصلان) */
  const [previewOverride, setPreviewOverride] = useState<TemplateKey | null>(null)
  const previewRef = useRef<HTMLElement>(null)
  const [colors, setColors] = useState<Record<ColorRole, string>>(DEFAULT_COLORS)
  const [drafts, setDrafts] = useState<Record<ColorRole, string>>(DEFAULT_COLORS)
  const [errors, setErrors] = useState<Partial<Record<ColorRole, string>>>({})
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const setRole = (role: ColorRole, hex: string) => {
    setColors((prev) => ({ ...prev, [role]: hex }))
    setDrafts((prev) => ({ ...prev, [role]: hex }))
    setErrors((prev) => ({ ...prev, [role]: undefined }))
  }

  const handleHexChange = (role: ColorRole, raw: string) => {
    setDrafts((prev) => ({ ...prev, [role]: raw }))
    const normalized = normalizeHex(raw)
    if (normalized) {
      setColors((prev) => ({ ...prev, [role]: normalized }))
      setErrors((prev) => ({ ...prev, [role]: undefined }))
    } else {
      setErrors((prev) => ({ ...prev, [role]: 'أدخل قيمة HEX صحيحة من 6 خانات — مثل #2a78d6' }))
    }
  }

  const resetColors = () => {
    setColors(DEFAULT_COLORS)
    setDrafts(DEFAULT_COLORS)
    setErrors({})
    setToast('استُعيدت الألوان الافتراضية (معاينة محلية)')
  }

  const warnings = useMemo(() => evaluateContrast(colors), [colors])
  const onPrimary = readableOn(colors.primary)
  /** القالب المعروض في المعاينة: المثبت أو المعايَن مؤقتاً */
  const shownTemplate = previewOverride ?? template
  const shownTemplateName = TEMPLATES.find((item) => item.key === shownTemplate)?.name ?? ''

  /* ألوان التاجر تُمرر للمعاينة كمتغيرات — النص فوق الأساسي مشتق آلياً (D6) */
  const previewStyle = {
    '--pv-primary': colors.primary,
    '--pv-secondary': colors.secondary,
    '--pv-background': colors.background,
    '--pv-surface': colors.surface,
    '--pv-text': colors.text,
    '--pv-on-primary': onPrimary,
  } as CSSProperties

  return (
    <AppShell
      context="merchant"
      className="appr-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('appearance')} />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={
            <>
              متجر العافية — <span className="ltr">alafya.tawa.ly</span>
            </>
          }
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title="المظهر والقوالب"
        description="ثبّت قالبك وخصّص ألوان هويتك بحرية كاملة (D6 محسوم) — ألوان الحالات الدلالية تبقى نظامية"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'المظهر والقوالب' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="appr-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {view === 'loading' && (
        <div className="appr-columns" aria-hidden="true">
          <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
            <Skeleton variant="rect" height={180} />
            <Skeleton variant="rect" height={360} />
          </div>
          <Skeleton variant="rect" height={420} />
        </div>
      )}

      {view === 'error' && (
        <div className="appr-card">
          <ErrorState
            description="تعذّر جلب القوالب وإعدادات المظهر — تحقق من اتصالك ثم أعد المحاولة."
            onRetry={() => setView('normal')}
          />
        </div>
      )}

      {view === 'normal' && (
        <>
      <Alert variant="info" title="كل التغييرات هنا محلية — معاينة تطويرية">
        التثبيت والنشر الفعليان والمعاينة المعزولة قبل النشر (1.3.5) تعمل مع الربط الخلفي؛ ترتيب أقسام الواجهة (1.3.4)
        يُبنى في مرحلة لاحقة.
      </Alert>

      <div className="appr-columns">
        <div style={{ display: 'grid', gap: 'var(--space-xl)', minWidth: 0 }}>
          <section className="appr-card" aria-labelledby="appr-templates-title">
            <h2 id="appr-templates-title">القوالب</h2>
            <div className="appr-templates" role="radiogroup" aria-label="اختيار قالب المتجر">
              {TEMPLATES.map((item) => (
                <div key={item.key} style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                  <label className="appr-template">
                    <input
                      type="radio"
                      className="visually-hidden"
                      name="appr-template"
                      checked={template === item.key}
                      onChange={() => {
                        /* التثبيت بنقرة واحدة كما توثقه 1.3.2 — لا حوار تأكيد */
                        setTemplate(item.key)
                        setPreviewOverride(null)
                        setToast(`ثُبّت قالب «${item.name}» (معاينة محلية)`)
                      }}
                    />
                    <span className="appr-template__card">
                      <span className={`appr-thumb appr-thumb--${item.key}`} aria-hidden="true">
                        {item.key === 'modern' ? (
                          <>
                            <span className="appr-thumb__bar" />
                            <span className="appr-thumb__hero" />
                            <span className="appr-thumb__bar" />
                          </>
                        ) : (
                          <>
                            <span className="appr-thumb__bar" />
                            <span className="appr-thumb__bar" />
                            <span className="appr-thumb__bar" />
                            <span className="appr-thumb__bar" />
                          </>
                        )}
                      </span>
                      <span className="appr-template__head">
                        <span className="appr-template__name">{item.name}</span>
                        {template === item.key && <Badge variant="info">مثبت</Badge>}
                      </span>
                      <span className="appr-template__desc">{item.description}</span>
                      <span className="appr-template__tags">عربي RTL ✓ · متجاوب ✓</span>
                    </span>
                  </label>
                  {template !== item.key && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewOverride(item.key)
                        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                      }}
                    >
                      معاينة «{item.name}» دون تثبيت
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="appr-card" aria-labelledby="appr-colors-title">
            <h2 id="appr-colors-title">ألوان المتجر</h2>
            <p className="appr-role__hint">
              اختر أي درجات تعبّر عن هويتك — نص الأزرار فوق الأساسي والثانوي يُشتق آلياً (
              {onPrimary === '#ffffff' ? 'أبيض' : 'أسود'} حالياً فوق الأساسي)
            </p>
            {COLOR_ROLES.map((role) => (
              <ColorRoleField
                key={role.key}
                label={role.label}
                hint={role.hint}
                value={colors[role.key]}
                draft={drafts[role.key]}
                error={errors[role.key]}
                onPick={(hex) => setRole(role.key, hex)}
                onHexChange={(raw) => handleHexChange(role.key, raw)}
              />
            ))}

            {warnings.length > 0 && (
              <Alert variant="warning" title="تنبيه مقروئية — الاختيار متاح لكن التباين ضعيف">
                <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
                  {warnings.map((warning) => (
                    <li key={warning.key}>
                      {warning.message} — النسبة الحالية <span className="numeric">{warning.ratio}:1</span> (المستحسن{' '}
                      <span className="numeric">4.5:1</span>)
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={resetColors}>
                استعادة الألوان الافتراضية
              </Button>
              <Button variant="primary" onClick={() => setToast('حُفظت الهوية (معاينة محلية — لا حفظ فعلياً)')}>
                حفظ التغييرات
              </Button>
            </div>
          </section>
        </div>

        <div className="appr-preview-col">
          <section className="appr-card" aria-labelledby="appr-preview-title" ref={previewRef}>
            <h2 id="appr-preview-title">معاينة حية (محلية)</h2>
            {previewOverride && previewOverride !== template && (
              <Alert
                variant="info"
                title={`تعاين قالب «${shownTemplateName}» — غير مثبت`}
                action={
                  <span style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setTemplate(previewOverride)
                        setPreviewOverride(null)
                        setToast(`ثُبّت قالب «${shownTemplateName}» (معاينة محلية)`)
                      }}
                    >
                      تثبيت هذا القالب
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setPreviewOverride(null)}>
                      إنهاء المعاينة
                    </Button>
                  </span>
                }
              />
            )}
            <div className="pv-frame" style={previewStyle}>
              <div className="pv-chrome">
                <span className="pv-chrome__dots" aria-hidden="true">
                  <span className="pv-chrome__dot" />
                  <span className="pv-chrome__dot" />
                  <span className="pv-chrome__dot" />
                </span>
                <span className="ltr">alafya.tawa.ly</span>
              </div>
              <div className={`pv-body pv-body--${shownTemplate}`}>
                <div className="pv-header">
                  <span className="pv-header__name">متجر العافية</span>
                  <button type="button" className="pv-header__cart" tabIndex={-1} aria-hidden="true">
                    السلة (2)
                  </button>
                </div>
                {shownTemplate === 'modern' && (
                  <div className="pv-hero">
                    <span className="pv-hero__title">عروض الصيف وصلت</span>
                    <span className="pv-hero__sub">خصومات على منتجات العناية حتى نهاية الشهر</span>
                  </div>
                )}
                <span className="pv-link">تصفح كل التصنيفات</span>
                <div className="pv-grid">
                  {['شامبو أرغان 400مل', 'كريم زبدة الشيا'].map((name, index) => (
                    <div className="pv-card" key={name}>
                      <span className="pv-card__img" aria-hidden="true" />
                      <span>
                        <span className="pv-card__name">{name}</span>
                        <br />
                        <span className="pv-card__price">
                          <span className="numeric">{index === 0 ? '45' : '18'} د.ل</span>
                        </span>
                      </span>
                      <button type="button" className="pv-card__btn" tabIndex={-1} aria-hidden="true">
                        أضف للسلة
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="appr-role__hint">
              المعاينة تعكس القالب المعروض وألوانك فوراً — ألوان الحالات (نجاح/تحذير/خطأ) نظامية ولا تتأثر باختيارك.
            </p>
          </section>
        </div>
      </div>
        </>
      )}

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
