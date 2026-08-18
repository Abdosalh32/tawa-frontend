import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './appearance.css'
import {
  Alert,
  AppShell,
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  IconButton,
  PageHeader,
  Radio,
  Skeleton,
  Switch,
  Toast,
  Topbar,
} from '../../../components/ui'
import { MerchantBreadcrumbs } from '../MerchantBreadcrumbs'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import {
  COLOR_ROLES,
  SECTION_TYPE_LABEL,
  TEMPLATES,
  THEME_DEFAULT_COLORS,
  THEME_DEFAULT_SECTIONS,
  deriveSurface,
  evaluateContrast,
  flatten,
  readableOn,
  validateColorValue,
} from './appearance-data'
import type { ColorRole, ColorRoleMeta, TemplateKey, ThemeColors, ThemeSection } from './appearance-data'

/**
 * قالب مثبت على المتجر — يقابل صفاً في `store_themes`:
 * كل تثبيت ينسخ ألوان القالب وأقسامه، وواحد فقط يكون `is_live`.
 */
interface InstalledTheme {
  id: string
  template: TemplateKey
  isLive: boolean
  colors: ThemeColors
  sections: readonly ThemeSection[]
}

/** الحالة الابتدائية: كلاسيك منشور (الباكند يثبّته تلقائياً عند إنشاء المتجر) */
const INITIAL_INSTALLED: readonly InstalledTheme[] = [
  {
    id: 'sth-1',
    template: 'classic',
    isLive: true,
    colors: THEME_DEFAULT_COLORS.classic,
    sections: THEME_DEFAULT_SECTIONS.classic,
  },
]

function ChevronUpGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 9l4-4 4 4" />
    </svg>
  )
}

function ChevronDownGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5l4 4 4-4" />
    </svg>
  )
}

/** صف تحرير دور لوني: منتقٍ أصلي + حقل نصي بتحقق محلي وفق حدود العقد */
function ColorRoleField({
  role,
  value,
  draft,
  error,
  onPick,
  onTextChange,
}: {
  role: ColorRoleMeta
  value: string
  draft: string
  error?: string
  onPick: (hex: string) => void
  onTextChange: (raw: string) => void
}) {
  const id = useId()
  /* منتقي المتصفح يفهم HEX الصلب فقط — الشفافية تُكتب في الحقل النصي */
  const pickerValue = flatten(value, '#ffffff')
  return (
    <div className="appr-role">
      <label className="tw-field__label" htmlFor={`${id}-picker`}>
        {role.label}
      </label>
      <div className="appr-role__row">
        <input
          id={`${id}-picker`}
          type="color"
          className="appr-role__picker"
          value={pickerValue}
          aria-label={`منتقي ${role.label}`}
          onChange={(event) => onPick(event.target.value)}
        />
        <input
          className="tw-control appr-role__hex ltr"
          dir="ltr"
          value={draft}
          maxLength={role.maxLength}
          aria-label={`قيمة ${role.label}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onTextChange(event.target.value)}
        />
        <span className="appr-role__hint">{role.hint}</span>
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
  /* المظهر يخصّ المتجر النشط (D5) — يقابل /stores/{id}/themes */
  const store = useActiveStore()
  const [installed, setInstalled] = useState<readonly InstalledTheme[]>(INITIAL_INSTALLED)
  /** القالب المفتوح للتخصيص (يقابل `storeThemeId` في مسار التخصيص) */
  const [editingId, setEditingId] = useState<string>(INITIAL_INSTALLED[0].id)
  const [drafts, setDrafts] = useState<ThemeColors>(INITIAL_INSTALLED[0].colors)
  const [errors, setErrors] = useState<Partial<Record<ColorRole, string>>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  /** إعلان صوتي لإعادة الترتيب — الترتيب بالأزرار يعمل بلوحة المفاتيح */
  const [orderAnnouncement, setOrderAnnouncement] = useState('')
  const previewRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const editing = installed.find((item) => item.id === editingId) ?? installed[0]
  const editingName = TEMPLATES.find((item) => item.key === editing.template)?.name ?? ''
  const colors = editing.colors

  /* تبديل القالب المفتوح يعيد تعبئة الحقول النصية بقيمه */
  useEffect(() => {
    setDrafts(colors)
    setErrors({})
  }, [colors])

  const patchEditing = (patch: Partial<InstalledTheme>) => {
    setInstalled((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...patch } : item)))
  }

  const setRole = (role: ColorRole, raw: string) => {
    patchEditing({ colors: { ...colors, [role]: raw } })
    setDrafts((prev) => ({ ...prev, [role]: raw }))
    setErrors((prev) => ({ ...prev, [role]: undefined }))
  }

  const handleTextChange = (role: ColorRoleMeta, raw: string) => {
    setDrafts((prev) => ({ ...prev, [role.key]: raw }))
    const check = validateColorValue(role, raw)
    if (check.value !== undefined) {
      patchEditing({ colors: { ...colors, [role.key]: check.value } })
      setErrors((prev) => ({ ...prev, [role.key]: undefined }))
    } else {
      setErrors((prev) => ({ ...prev, [role.key]: check.error }))
    }
  }

  const resetColors = () => {
    const defaults = THEME_DEFAULT_COLORS[editing.template]
    patchEditing({ colors: defaults })
    setDrafts(defaults)
    setErrors({})
    setToast(`استُعيدت ألوان قالب «${editingName}» الافتراضية (معاينة محلية)`)
  }

  const installTemplate = (template: TemplateKey) => {
    /* الباكند يثبّت القالب الجديد كمسودة ثم يُنشر بخطوة مستقلة */
    const id = `sth-${installed.length + 1}`
    const name = TEMPLATES.find((item) => item.key === template)?.name ?? ''
    setInstalled((prev) => [
      ...prev,
      {
        id,
        template,
        isLive: false,
        colors: THEME_DEFAULT_COLORS[template],
        sections: THEME_DEFAULT_SECTIONS[template],
      },
    ])
    setEditingId(id)
    setToast(`ثُبّت قالب «${name}» كمسودة — عاينه ثم انشره (معاينة محلية)`)
  }

  const publishTheme = (id: string) => {
    const target = installed.find((item) => item.id === id)
    if (!target) return
    setInstalled((prev) => prev.map((item) => ({ ...item, isLive: item.id === id })))
    const name = TEMPLATES.find((item) => item.key === target.template)?.name ?? ''
    setToast(`نُشر قالب «${name}» كقالب المتجر الرئيسي (معاينة محلية)`)
  }

  const deleteTarget = installed.find((item) => item.id === deleteId) ?? null

  const confirmDelete = () => {
    if (!deleteTarget) return
    setInstalled((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    if (editingId === deleteTarget.id) {
      const fallback = installed.find((item) => item.id !== deleteTarget.id)
      if (fallback) setEditingId(fallback.id)
    }
    setDeleteId(null)
    setToast('حُذفت مسودة القالب (معاينة محلية)')
  }

  /* ═══ الأقسام (1.3.4): الترتيب هو ترتيب المصفوفة في `sections` ═══ */
  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...editing.sections]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    patchEditing({ sections: next })
    setOrderAnnouncement(`نُقل «${moved.title}» إلى الموضع ${target + 1} من ${next.length}`)
  }

  const toggleSection = (id: string, visible: boolean) => {
    patchEditing({ sections: editing.sections.map((section) => (section.id === id ? { ...section, visible } : section)) })
  }

  const renameSection = (id: string, title: string) => {
    patchEditing({ sections: editing.sections.map((section) => (section.id === id ? { ...section, title } : section)) })
  }

  const resetSections = () => {
    patchEditing({ sections: THEME_DEFAULT_SECTIONS[editing.template] })
    setOrderAnnouncement('استُعيد الترتيب الافتراضي للأقسام')
    setToast(`استُعيدت أقسام قالب «${editingName}» الافتراضية (معاينة محلية)`)
  }

  const warnings = useMemo(() => evaluateContrast(colors), [colors])
  const surface = deriveSurface(colors.background)
  const onPrimary = readableOn(colors.primary)
  const visibleSections = editing.sections.filter((section) => section.visible)

  /* ألوان التاجر تُمرر للمعاينة كمتغيرات — النصوص فوقها مشتقة آلياً (D6) */
  const previewStyle = {
    '--pv-primary': colors.primary,
    '--pv-secondary': colors.secondary,
    '--pv-background': colors.background,
    '--pv-surface': surface,
    '--pv-text': colors.text_color,
    '--pv-header-bg': colors.header_bg,
    '--pv-footer-bg': colors.footer_bg,
    '--pv-on-primary': onPrimary,
    '--pv-on-header': readableOn(colors.header_bg, colors.background),
    '--pv-on-footer': readableOn(colors.footer_bg, colors.background),
  } as CSSProperties

  return (
    <AppShell
      context="merchant"
      className="appr-shell"
      sidebar={<MerchantSidebar active="appearance" />}
      topbar={<Topbar title="لوحة التاجر" storeContext={<StoreSwitcher />} userName="فاطمة" />}
    >
      <PageHeader
        title="المظهر والقوالب"
        description="ثبّت القوالب كمسودّات، خصّص ألوانها وترتيب أقسامها، ثم انشر واحداً كقالب متجرك"
        breadcrumbs={<MerchantBreadcrumbs items={[{ label: 'الرئيسية', to: 'overview' }, { label: 'المظهر والقوالب' }]} />}
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
            التثبيت والنشر والحذف الفعليان يعملون مع الربط الخلفي؛ والمعاينة المعزولة على نطاق مؤقت (1.3.5) تُبنى معه.
            إعدادات الأقسام الخاصة بالقالب تُعرض للقراءة فقط في هذه المرحلة.
          </Alert>

          <div className="appr-columns">
            <div style={{ display: 'grid', gap: 'var(--space-xl)', minWidth: 0 }}>
              <section className="appr-card" aria-labelledby="appr-templates-title">
                <h2 id="appr-templates-title">القوالب</h2>
                <div className="appr-templates">
                  {TEMPLATES.map((item) => {
                    const installedTheme = installed.find((entry) => entry.template === item.key)
                    const isEditing = installedTheme?.id === editing.id
                    return (
                      <div key={item.key} className={`appr-template${isEditing ? ' is-editing' : ''}`}>
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
                          {installedTheme ? (
                            installedTheme.isLive ? (
                              <Badge variant="success">منشور — قالب المتجر</Badge>
                            ) : (
                              <Badge variant="info">مسودة مثبتة</Badge>
                            )
                          ) : (
                            <Badge variant="neutral" dot={false}>
                              غير مثبت
                            </Badge>
                          )}
                        </span>
                        <span className="appr-template__desc">{item.description}</span>
                        <span className="appr-template__tags">عربي RTL ✓ · متجاوب ✓</span>
                        <span className="appr-template__actions">
                          {!installedTheme && (
                            <Button variant="primary" size="sm" onClick={() => installTemplate(item.key)}>
                              تثبيت كمسودة
                            </Button>
                          )}
                          {installedTheme && !isEditing && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setEditingId(installedTheme.id)
                                previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                              }}
                            >
                              تخصيص ومعاينة
                            </Button>
                          )}
                          {installedTheme && !installedTheme.isLive && (
                            <>
                              <Button variant="primary" size="sm" onClick={() => publishTheme(installedTheme.id)}>
                                نشر
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteId(installedTheme.id)}>
                                حذف المسودة
                              </Button>
                            </>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="appr-role__hint">
                  القالب المنشور واحد فقط، ولا يُحذف قالب منشور — انشر غيره أولاً.
                </p>
              </section>

              <section className="appr-card" aria-labelledby="appr-colors-title">
                <h2 id="appr-colors-title">ألوان القالب «{editingName}»</h2>
                <p className="appr-role__hint">
                  اختر أي درجات تعبّر عن هويتك — نصوص الأزرار والترويسة والتذييل تُشتق آلياً (
                  {onPrimary === '#ffffff' ? 'أبيض' : 'أسود'} حالياً فوق الأساسي)، ولون البطاقات مشتق من خلفية المتجر.
                </p>
                {COLOR_ROLES.map((role) => (
                  <ColorRoleField
                    key={role.key}
                    role={role}
                    value={colors[role.key]}
                    draft={drafts[role.key]}
                    error={errors[role.key]}
                    onPick={(hex) => setRole(role.key, hex)}
                    onTextChange={(raw) => handleTextChange(role, raw)}
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
                    استعادة ألوان القالب الافتراضية
                  </Button>
                  <Button variant="primary" onClick={() => setToast('حُفظت الهوية (معاينة محلية — لا حفظ فعلياً)')}>
                    حفظ التغييرات
                  </Button>
                </div>
              </section>

              <section className="appr-card" aria-labelledby="appr-sections-title">
                <h2 id="appr-sections-title">أقسام واجهة المتجر</h2>
                <p className="appr-role__hint">
                  رتّب الأقسام وأظهر ما تريد — الترتيب هنا هو ترتيب ظهورها للزبون (المتطلب 1.3.4).
                </p>
                <ol className="appr-sections">
                  {editing.sections.map((section, index) => (
                    <li className="appr-section" key={section.id}>
                      <span className="appr-section__order numeric" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="appr-section__main">
                        {/* العنوان حقل مطلوب في عقد التخصيص — التسمية المرئية هي القيمة نفسها */}
                        <input
                          className="tw-control appr-section__title"
                          value={section.title}
                          maxLength={120}
                          aria-label={`عنوان القسم ${index + 1} (${SECTION_TYPE_LABEL[section.type]})`}
                          onChange={(event) => renameSection(section.id, event.target.value)}
                        />
                        <span className="appr-section__meta">
                          <Badge variant="neutral" dot={false}>
                            {SECTION_TYPE_LABEL[section.type]}
                          </Badge>
                          <span className="appr-section__id ltr">{section.id}</span>
                        </span>
                        {section.settings && (
                          <span className="appr-section__settings">
                            {Object.entries(section.settings).map(([key, value]) => (
                              <span className="appr-section__setting" key={key}>
                                <span className="ltr">{key}</span>:{' '}
                                <span className="ltr">{typeof value === 'boolean' ? (value ? 'مُفعّل' : 'مُعطّل') : String(value)}</span>
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                      <div className="appr-section__controls">
                        <Switch
                          label={section.visible ? 'ظاهر' : 'مخفي'}
                          checked={section.visible}
                          onChange={(next) => toggleSection(section.id, next)}
                        />
                        <span className="appr-section__move">
                          <IconButton
                            label={`نقل «${section.title}» للأعلى`}
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveSection(index, -1)}
                          >
                            <ChevronUpGlyph />
                          </IconButton>
                          <IconButton
                            label={`نقل «${section.title}» للأسفل`}
                            size="sm"
                            disabled={index === editing.sections.length - 1}
                            onClick={() => moveSection(index, 1)}
                          >
                            <ChevronDownGlyph />
                          </IconButton>
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="visually-hidden" role="status" aria-live="polite">
                  {orderAnnouncement}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={resetSections}>
                    استعادة الترتيب الافتراضي
                  </Button>
                  <Button variant="primary" onClick={() => setToast('حُفظ ترتيب الأقسام (معاينة محلية — لا حفظ فعلياً)')}>
                    حفظ الترتيب
                  </Button>
                </div>
              </section>
            </div>

            <div className="appr-preview-col">
              <section className="appr-card" aria-labelledby="appr-preview-title" ref={previewRef}>
                <h2 id="appr-preview-title">معاينة حية (محلية)</h2>
                {!editing.isLive && (
                  <Alert
                    variant="info"
                    title={`تعاين مسودة قالب «${editingName}» — غير منشورة`}
                    action={
                      <Button variant="primary" size="sm" onClick={() => publishTheme(editing.id)}>
                        نشر هذا القالب
                      </Button>
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
                    <span className="ltr">{store.subdomain}</span>
                  </div>
                  <div className={`pv-body pv-body--${editing.template}`}>
                    <div className="pv-header">
                      <span className="pv-header__name">{store.name}</span>
                      <button type="button" className="pv-header__cart" tabIndex={-1} aria-hidden="true">
                        السلة (2)
                      </button>
                    </div>

                    {visibleSections.length === 0 && (
                      <p className="pv-empty">كل الأقسام مخفية — لن يرى الزبون محتوى بين الترويسة والتذييل.</p>
                    )}

                    {visibleSections.map((section) => {
                      if (section.type === 'hero') {
                        return (
                          <div className="pv-hero" key={section.id}>
                            <span className="pv-hero__title">{section.title}</span>
                            <span className="pv-hero__sub">خصومات على منتجات العناية حتى نهاية الشهر</span>
                          </div>
                        )
                      }
                      if (section.type === 'categories') {
                        return (
                          <span className="pv-link" key={section.id}>
                            {section.title}
                          </span>
                        )
                      }
                      /* إطار المعاينة أضيق من المتجر الفعلي — نحدّه بعمودين ليبقى مقروءاً،
                         وعدد الأعمدة المضبوط (settings.columns) يظهر في صف القسم */
                      const columns = typeof section.settings?.columns === 'number' ? Math.min(section.settings.columns, 2) : 2
                      return (
                        <div key={section.id}>
                          <span className="pv-section-title">{section.title}</span>
                          <div className="pv-grid" style={{ '--pv-columns': columns } as CSSProperties}>
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
                      )
                    })}

                    <div className="pv-footer">
                      <span>سياسة الاسترجاع · تواصل معنا</span>
                      <span>متجر على منصة توا</span>
                    </div>
                  </div>
                </div>
                <p className="appr-role__hint">
                  المعاينة تعكس القالب وألوانه وترتيب أقسامه فوراً — ألوان الحالات (نجاح/تحذير/خطأ) نظامية ولا تتأثر
                  باختيارك.
                </p>
              </section>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          title="حذف مسودة القالب؟"
          impact={`ستفقد تخصيصات ألوان وأقسام مسودة «${TEMPLATES.find((item) => item.key === deleteTarget.template)?.name}» نهائياً — القالب المنشور لا يتأثر.`}
          confirmLabel="حذف المسودة"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
