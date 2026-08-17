import { useEffect, useRef, useState } from 'react'
import './store-settings.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  Input,
  PageHeader,
  Radio,
  Select,
  Tabs,
  Textarea,
  Toast,
  Topbar,
} from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { STORE_STATUS } from '../../../types/status'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import {
  ACTIVITY_OPTIONS,
  LIFECYCLE_META,
  MOCK_PUBLISHED_PRODUCTS,
  MOCK_REJECTION_REASON,
  lifecycleFor,
  settingsFor,
  validateSettings,
} from './store-settings-data'
import type { SettingsErrors, StoreLifecycle, StoreSettingsForm } from './store-settings-data'

type SettingsTab = 'general' | 'logo' | 'language' | 'domain' | 'publishing'

const TAB_ITEMS = [
  { key: 'general', label: 'البيانات الأساسية' },
  { key: 'logo', label: 'الشعار' },
  { key: 'language', label: 'اللغة' },
  { key: 'domain', label: 'النطاق الفرعي' },
  { key: 'publishing', label: 'النشر والاعتماد' },
] as const

const LIFECYCLE_OPTIONS: ReadonlyArray<{ value: StoreLifecycle; label: string }> = [
  { value: 'active', label: 'منشور (الافتراضي — متسق مع بقية الشاشات)' },
  { value: 'pending', label: 'بانتظار الاعتماد' },
  { value: 'approved', label: 'معتمد غير منشور' },
  { value: 'maintenance', label: 'موقوف مؤقتاً (صيانة)' },
  { value: 'suspended', label: 'الحساب معلّق من الإدارة' },
  { value: 'rejected', label: 'مرفوض (بلا مقابل خلفي)' },
]

/** بند Checklist متطلبات النشر (1.2.4) */
function CheckItem({
  state,
  label,
  hint,
}: {
  state: 'met' | 'unmet' | 'pending-decision'
  label: string
  hint?: string
}) {
  return (
    <li className={`sset-check ${state === 'met' ? 'sset-check--met' : state === 'unmet' ? 'sset-check--unmet' : ''}`}>
      <span className="sset-check__mark" aria-hidden="true">
        {state === 'met' ? '✓' : state === 'unmet' ? '✗' : '؟'}
      </span>
      <span className="sset-check__text">
        <span>
          {label}{' '}
          {state === 'pending-decision' && (
            <Badge variant="warning" dot={false}>
              بانتظار قرار المنتج
            </Badge>
          )}
          <span className="visually-hidden">{state === 'met' ? '(مستوفى)' : state === 'unmet' ? '(غير مستوفى)' : ''}</span>
        </span>
        {hint && <span className="sset-check__hint">{hint}</span>}
      </span>
    </li>
  )
}

export function MerchantStoreSettings() {
  const [tab, setTab] = useState<SettingsTab>('general')
  /* كل إعداد هنا يخصّ المتجر النشط (D5) — يقابل PUT /stores/{id} */
  const store = useActiveStore()
  const [form, setForm] = useState<StoreSettingsForm>(() => settingsFor(store))
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [lifecycle, setLifecycle] = useState<StoreLifecycle>(() => lifecycleFor(store.status))

  /* تبديل المتجر يعيد تحميل إعداداته وحالته المشتقة */
  useEffect(() => {
    setForm(settingsFor(store))
    setErrors({})
    setLifecycle(lifecycleFor(store.status))
  }, [store])
  const [pauseOpen, setPauseOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const saveGeneral = () => {
    const nextErrors = validateSettings(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setToast('حُفظت التغييرات (معاينة محلية — لا حفظ فعلياً)')
  }

  const approvalMet = lifecycle !== 'pending' && lifecycle !== 'rejected' && lifecycle !== 'suspended'
  const publishedCount = store.hasSeedData ? MOCK_PUBLISHED_PRODUCTS : 0
  const errorMessages = Object.values(errors)

  return (
    <AppShell
      context="merchant"
      className="sset-shell"
      sidebar={<MerchantSidebar active="settings" />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title="إعدادات المتجر"
        description="بيانات المتجر ولغته ونطاقه وحالة النشر — النشر يتاح بعد الاعتماد واستيفاء المتطلبات (1.2.4)"
        meta={<Badge variant={LIFECYCLE_META[lifecycle].variant}>{LIFECYCLE_META[lifecycle].label}</Badge>}
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'إعدادات المتجر' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة المتجر (بيانات تجريبية، لا اعتماد ولا نشر فعلياً)</legend>
        <div className="dev-fieldset__options">
          {LIFECYCLE_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="sset-lifecycle"
              label={option.label}
              checked={lifecycle === option.value}
              onChange={() => setLifecycle(option.value)}
            />
          ))}
        </div>
      </fieldset>

      <Tabs label="أقسام الإعدادات" items={[...TAB_ITEMS]} value={tab} onChange={(key) => setTab(key as SettingsTab)} />

      {tab === 'general' && (
        <section className="sset-card" aria-labelledby="sset-general-title">
          <h2 id="sset-general-title">البيانات الأساسية</h2>
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
          <Input
            label="اسم المتجر"
            value={form.storeName}
            error={errors.storeName}
            onChange={(event) => setForm((prev) => ({ ...prev, storeName: event.target.value }))}
          />
          <Select
            label="فئة النشاط"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          >
            {/* متجر جديد بلا فئة محددة — لا نختار له فئة تلقائياً */}
            {form.category === '' && <option value="">اختر فئة النشاط…</option>}
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Textarea
            label="وصف المتجر"
            optional
            helperText="البيانات التعريفية تظهر لزبائنك (1.2.3)"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Input
            label="هاتف التواصل"
            type="tel"
            optional
            helperText="يظهر في تذييل متجرك لزبائنك"
            value={form.contactPhone}
            error={errors.contactPhone}
            onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
          />
          <div className="sset-actions">
            <Button variant="primary" onClick={saveGeneral}>
              حفظ التغييرات
            </Button>
          </div>
        </section>
      )}

      {tab === 'logo' && (
        <section className="sset-card" aria-labelledby="sset-logo-title">
          <h2 id="sset-logo-title">الشعار</h2>
          <div className="sset-logo">
            <span className="sset-logo__circle" aria-hidden="true">
              <TagGlyph />
            </span>
            <div>
              <Badge variant="warning">تغيير الشعار — مؤجل</Badge>
              <p className="sset-note">الشعار موثق (1.2.3) وآلية الرفع/التغيير غير مخصصة — تُبنى مع الربط الفعلي.</p>
            </div>
          </div>
        </section>
      )}

      {tab === 'language' && (
        <section className="sset-card" aria-labelledby="sset-lang-title">
          <h2 id="sset-lang-title">اللغة الافتراضية للمتجر</h2>
          <Radio
            name="sset-language"
            label="العربية"
            description="واجهة RTL كاملة"
            checked={form.language === 'ar'}
            onChange={() => {
              setForm((prev) => ({ ...prev, language: 'ar' }))
              setToast('اللغة الآن: العربية (اختيار محلي — لا حفظ فعلياً)')
            }}
          />
          <Radio
            name="sset-language"
            label="English"
            description="واجهة LTR — خارج نطاق المرحلة الحالية (G9)"
            checked={form.language === 'en'}
            onChange={() => {
              setForm((prev) => ({ ...prev, language: 'en' }))
              setToast('اللغة الآن: English (اختيار محلي — لا حفظ فعلياً)')
            }}
          />
          <p className="sset-note">ضبط اللغة الافتراضية موثق (1.5.6) — الترجمة الكاملة للواجهة خارج هذه المرحلة.</p>
        </section>
      )}

      {tab === 'domain' && (
        <section className="sset-card" aria-labelledby="sset-domain-title">
          <h2 id="sset-domain-title">النطاق الفرعي</h2>
          <div className="sset-domain-row">
            <span className="sset-domain-value ltr">{store.subdomain}</span>
            <Badge variant={STORE_STATUS[store.status].variant}>{STORE_STATUS[store.status].label}</Badge>
          </div>
          <Alert variant="info" title="حجز النطاق وتغييره عملية خلفية">
            حُجز النطاق فور التسجيل (1.2.1)؛ التحقق من التوفر وطلب التغيير (برومت 10) يُداران مع الربط الخلفي — لا فحص
            توفر هنا.
          </Alert>
          <div className="sset-actions">
            <Button variant="ghost">طلب تغيير النطاق</Button>
          </div>
        </section>
      )}

      {tab === 'publishing' && (
        <section className="sset-card" aria-labelledby="sset-pub-title">
          <h2 id="sset-pub-title">النشر والاعتماد</h2>

          <div className={`sset-status-hero sset-status-hero--${lifecycle}`}>
            <span className="sset-status-hero__dot" aria-hidden="true" />
            <span>
              {lifecycle === 'active' && 'متجرك منشور ويستقبل الطلبات'}
              {lifecycle === 'suspended' && 'حسابك معلّق من الإدارة — متجرك مغلق مؤقتاً'}
              {lifecycle === 'maintenance' && 'متجرك موقوف مؤقتاً — الزوار يرون صفحة صيانة'}
              {lifecycle === 'pending' && 'متجرك بانتظار اعتماد الإدارة'}
              {lifecycle === 'approved' && 'حسابك معتمد — متجرك غير منشور بعد'}
              {lifecycle === 'rejected' && 'رُفض طلب التوثيق — راجع السبب أدناه'}
            </span>
            <Badge variant={LIFECYCLE_META[lifecycle].variant}>{LIFECYCLE_META[lifecycle].label}</Badge>
          </div>

          {lifecycle === 'suspended' && (
            <Alert variant="error" title="حسابك معلّق من الإدارة">
              متجرك مغلق مؤقتاً حتى فك التعليق (م.1.3.4 – م.1.3.5) — التعليق يقع على حساب التاجر بحسب عقد الباكند.
            </Alert>
          )}

          {lifecycle === 'rejected' && (
            <Alert variant="error" title="سبب الرفض (يظهر لك لتصحّح وتعيد التقديم — م.1.3.3)">
              {MOCK_REJECTION_REASON}
              <br />
              إعادة التقديم بعد التصحيح تعمل مع الربط الخلفي — وسير رفع الوثائق قرار معلّق (D3).
            </Alert>
          )}

          <div>
            <h3 style={{ fontSize: 'var(--type-body)', marginBlockEnd: 'var(--space-md)' }}>متطلبات النشر (1.2.4)</h3>
            <ul className="sset-checklist">
              <CheckItem
                state={approvalMet ? 'met' : 'unmet'}
                label="اعتماد الإدارة لحساب التاجر"
                hint="يفعّل حسابك رسمياً ويتيح النشر (م.1.3.2)"
              />
              <CheckItem
                state={publishedCount > 0 ? 'met' : 'unmet'}
                label="منتج واحد منشور على الأقل"
                hint={
                  publishedCount > 0
                    ? `لديك ${publishedCount} منتجاً منشوراً — الحد الأدنى افتراض موثق (A6)`
                    : 'لا منتجات منشورة في هذا المتجر بعد — أضف منتجاً واحداً على الأقل (A6)'
                }
              />
              <CheckItem
                state="pending-decision"
                label="السياسات الإلزامية"
                hint="قائمة السياسات المطلوبة لم تُحسم بعد (G1) — لا يمنع النشر في هذه المعاينة"
              />
            </ul>
          </div>

          {lifecycle === 'pending' && (
            <div className="sset-actions">
              <Button variant="primary" disabled>
                نشر المتجر
              </Button>
              <p className="sset-note">الناقص: اعتماد الإدارة — يتفعّل الزر باستيفاء المتطلبات (س2)</p>
            </div>
          )}

          {lifecycle === 'approved' && (
            <div className="sset-actions">
              <Button
                variant="primary"
                onClick={() => {
                  setLifecycle('active')
                  setToast('نُشر المتجر (معاينة محلية — لا نشر فعلياً)')
                }}
              >
                نشر المتجر
              </Button>
            </div>
          )}

          {lifecycle === 'active' && (
            <div className="sset-actions">
              <Button variant="secondary" onClick={() => setPauseOpen(true)}>
                إيقاف استقبال الطلبات مؤقتاً
              </Button>
            </div>
          )}

          {lifecycle === 'maintenance' && (
            <div className="sset-actions">
              <Button
                variant="primary"
                onClick={() => {
                  setLifecycle('active')
                  setToast('استُؤنف استقبال الطلبات (معاينة محلية)')
                }}
              >
                استئناف استقبال الطلبات
              </Button>
              <p className="sset-note">طلباتك السابقة بقيت قابلة للإدارة طوال الإيقاف (1.2.5)</p>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        open={pauseOpen}
        title="إيقاف استقبال الطلبات مؤقتاً"
        impact="سيرى الزوار صفحة صيانة أنيقة، وتبقى طلباتك السابقة قابلة للإدارة من اللوحة (1.2.5) — معاينة محلية، لا تغيير فعلياً."
        confirmLabel="إيقاف الاستقبال"
        onConfirm={() => {
          setPauseOpen(false)
          setLifecycle('maintenance')
          setToast('أُوقف استقبال الطلبات مؤقتاً (معاينة محلية)')
        }}
        onCancel={() => setPauseOpen(false)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
