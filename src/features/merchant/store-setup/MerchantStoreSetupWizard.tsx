import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import './store-setup.css'
import { Alert, Badge, Button, Field, Input, Radio, Select, Stepper, Toast, fieldDescribedBy } from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { ACTIVITY_OPTIONS, emptySetup, validateStep1, validateSubdomain } from './store-setup-data'
import type { Step1Errors, StoreLanguage, StoreSetupState } from './store-setup-data'

/** الخطوات الموثقة الثلاث (برومت 2) — لا خطوة قوالب (القوالب داخل اللوحة، 1.3.1) */
const STEPS = [
  { key: 'info', label: 'بيانات المتجر' },
  { key: 'language', label: 'اللغة' },
  { key: 'domain', label: 'النطاق' },
] as const

type StepKey = (typeof STEPS)[number]['key']
type WizardView = StepKey | 'done'

function CheckGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 15l6 6L23 8" />
    </svg>
  )
}

/** بطاقتا اختيار اللغة (برومت 2) مع معاينة مصغرة — راديو أصلي للوصولية */
function LanguageCards({ value, onChange }: { value: StoreLanguage; onChange: (language: StoreLanguage) => void }) {
  const groupId = useId()
  return (
    <div className="tw-field">
      <p className="tw-field__label" id={`${groupId}-label`}>
        اللغة الافتراضية للمتجر
      </p>
      <div className="setup-langs" role="radiogroup" aria-labelledby={`${groupId}-label`}>
        <label className="setup-lang">
          <input
            type="radio"
            className="visually-hidden"
            name={`${groupId}-lang`}
            checked={value === 'ar'}
            onChange={() => onChange('ar')}
          />
          <span className="setup-lang__card">
            <span className="setup-lang__name">العربية</span>
            <span className="setup-lang__preview" dir="rtl">
              مرحباً بكم في متجرنا — تسوقوا أحدث المنتجات
            </span>
          </span>
        </label>
        <label className="setup-lang">
          <input
            type="radio"
            className="visually-hidden"
            name={`${groupId}-lang`}
            checked={value === 'en'}
            onChange={() => onChange('en')}
          />
          <span className="setup-lang__card">
            <span className="setup-lang__name ltr">English</span>
            <span className="setup-lang__preview ltr" dir="ltr">
              Welcome to our store — shop the latest products
            </span>
          </span>
        </label>
      </div>
      <p className="tw-field__helper">واجهة LTR الكاملة للمتجر الإنجليزي خارج نطاق المرحلة الحالية (سؤال G9)</p>
    </div>
  )
}

export function MerchantStoreSetupWizard() {
  const navigate = useNavigate()
  /* الافتراضي: الخطوة الأولى */
  const [view, setView] = useState<WizardView>('info')
  const [setup, setSetup] = useState<StoreSetupState>(emptySetup)
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({})
  const [domainError, setDomainError] = useState<string | undefined>()
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const domainId = useId()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const focusSummary = () => requestAnimationFrame(() => summaryRef.current?.focus())

  const nextFromInfo = () => {
    const errors = validateStep1(setup)
    setStep1Errors(errors)
    if (Object.keys(errors).length > 0) {
      focusSummary()
      return
    }
    setView('language')
  }

  const finish = () => {
    const error = validateSubdomain(setup.subdomain)
    setDomainError(error)
    if (error) {
      focusSummary()
      return
    }
    setView('done')
    setToast('اكتمل الإعداد (معاينة محلية — لا إنشاء ولا حجز فعلياً)')
  }

  /** زر الأخطاء التطويري يستدعي إجراء الخطوة الحالية */
  const devTriggerValidation = () => {
    if (view === 'info') nextFromInfo()
    else if (view === 'domain') finish()
    else setToast('هذه الخطوة بلا تحقق — الاختيار محسوم افتراضياً')
  }

  const activeErrors: string[] =
    view === 'info' ? Object.values(step1Errors) : view === 'domain' && domainError ? [domainError] : []

  return (
    <div className="setup-root">
      <div className="setup-dev">
        <fieldset className="dev-fieldset">
          <legend>أداة معاينة تطويرية — لا إنشاء متجر ولا حجز نطاق فعلياً</legend>
          <div className="dev-fieldset__options">
            <Radio name="setup-view" label="الخطوة 1: بيانات المتجر (الافتراضية)" checked={view === 'info'} onChange={() => setView('info')} />
            <Radio name="setup-view" label="الخطوة 2: اللغة" checked={view === 'language'} onChange={() => setView('language')} />
            <Radio name="setup-view" label="الخطوة 3: النطاق" checked={view === 'domain'} onChange={() => setView('domain')} />
            <Radio name="setup-view" label="شاشة النجاح" checked={view === 'done'} onChange={() => setView('done')} />
            <Button variant="secondary" size="sm" onClick={devTriggerValidation}>
              إظهار أخطاء التحقق
            </Button>
          </div>
        </fieldset>
      </div>

      <div className="setup-main">
        <div className="setup-card">
          <div className="setup-head">
            <p className="setup-head__logo">توا</p>
            <h1 style={{ fontSize: 'var(--type-h2)' }}>إعداد متجرك</h1>
            {view !== 'done' && <Stepper steps={STEPS} currentKey={view} label="خطوات إعداد المتجر" />}
          </div>

          {activeErrors.length > 0 && view !== 'done' && (
            <div ref={summaryRef} tabIndex={-1}>
              <Alert variant="error" title="راجع الحقول التالية">
                <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
                  {activeErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </Alert>
            </div>
          )}

          {view === 'info' && (
            <div className="setup-step">
              <Input
                label="اسم المتجر"
                value={setup.storeName}
                error={step1Errors.storeName}
                onChange={(event) => setSetup((prev) => ({ ...prev, storeName: event.target.value }))}
              />
              <Select
                label="فئة النشاط"
                value={setup.category}
                error={step1Errors.category}
                onChange={(event) => setSetup((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option value="">اختر فئة النشاط…</option>
                {ACTIVITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {/* شعار المتجر مطلوب (1.2.3) لكن آلية الرفع غير مخصصة — Placeholder مؤجل */}
              <div className="setup-logo-deferred">
                <span className="setup-logo-deferred__circle" aria-hidden="true">
                  <TagGlyph />
                </span>
                <div>
                  <Badge variant="warning">شعار المتجر — مؤجل</Badge>
                  <p className="setup-logo-deferred__text">رفع الشعار موثق (1.2.3) وآلية الرفع تُبنى مع الربط الفعلي</p>
                </div>
              </div>
              <div className="setup-footer">
                <span />
                <Button variant="primary" onClick={nextFromInfo}>
                  التالي
                </Button>
              </div>
            </div>
          )}

          {view === 'language' && (
            <div className="setup-step">
              <LanguageCards value={setup.language} onChange={(language) => setSetup((prev) => ({ ...prev, language }))} />
              <div className="setup-footer">
                <Button variant="ghost" onClick={() => setView('info')}>
                  السابق
                </Button>
                <Button variant="primary" onClick={() => setView('domain')}>
                  التالي
                </Button>
              </div>
            </div>
          )}

          {view === 'domain' && (
            <div className="setup-step">
              <Field
                id={domainId}
                label="النطاق الفرعي لمتجرك"
                error={domainError}
                helperText="أحرف لاتينية صغيرة وأرقام وشرطات — يُحجز فور التسجيل (1.2.1)"
              >
                <span className="setup-domain">
                  <span className="setup-domain__suffix">.tawa.ly</span>
                  <input
                    id={domainId}
                    className="tw-control"
                    dir="ltr"
                    autoComplete="off"
                    value={setup.subdomain}
                    aria-invalid={domainError ? true : undefined}
                    aria-describedby={fieldDescribedBy(domainId, 'أحرف لاتينية صغيرة وأرقام وشرطات — يُحجز فور التسجيل (1.2.1)', domainError)}
                    onChange={(event) => setSetup((prev) => ({ ...prev, subdomain: event.target.value }))}
                  />
                </span>
              </Field>
              <Alert variant="info" title="التحقق من توفر النطاق وحجزه فحص خلفي">
                هذه الخطوة تتحقق من صيغة الاسم محلياً فقط — التوفر الفعلي والاقتراحات البديلة (برومت 2) تعمل مع الربط
                الخلفي، ولا يُعد الاسم محجوزاً الآن.
              </Alert>
              <div className="setup-footer">
                <Button variant="ghost" onClick={() => setView('language')}>
                  السابق
                </Button>
                <Button variant="primary" onClick={finish}>
                  إنهاء الإعداد
                </Button>
              </div>
            </div>
          )}

          {view === 'done' && (
            <div className="setup-success">
              <span className="setup-success__icon" aria-hidden="true">
                <CheckGlyph />
              </span>
              <h2>متجرك جاهز للتجهيز!</h2>
              {setup.storeName && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  {setup.storeName}
                  {setup.subdomain && (
                    <>
                      {' — '}
                      <span className="ltr">{setup.subdomain}.tawa.ly</span>
                    </>
                  )}
                </p>
              )}
              <Alert variant="warning" title="متجرك غير منشور بعد — بانتظار اعتماد الإدارة">
                يصبح النشر متاحاً بعد اعتماد الإدارة واستيفاء متطلبات النشر (1.2.4) — هذه معاينة محلية، لم يُنشأ متجر
                فعلياً.
              </Alert>
              <Button variant="primary" onClick={() => navigate('/')}>الذهاب إلى لوحة التحكم</Button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </div>
  )
}
