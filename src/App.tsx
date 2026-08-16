import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import './styles/preview.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  IconButton,
  Input,
  KeyValueList,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  PermissionDeniedState,
  Radio,
  SearchField,
  Select,
  Sidebar,
  Skeleton,
  SummaryCard,
  Switch,
  Tabs,
  Textarea,
  Toast,
  Tooltip,
  Topbar,
} from './components/ui'
import type { DataTableColumn, SidebarGroup, SortDirection } from './components/ui'
import {
  DotsGlyph,
  GearGlyph,
  HomeGlyph,
  InfoGlyph,
  LayersGlyph,
  OrdersGlyph,
  PlusGlyph,
  ScrollGlyph,
  ShieldGlyph,
  TagGlyph,
  UsersGlyph,
} from './components/ui/icons'
import { MerchantDashboardOverview } from './features/merchant/dashboard/MerchantDashboardOverview'
import { MerchantProductsList } from './features/merchant/products/MerchantProductsList'
import { APPROVAL_STATUS, ORDER_STATUS, PAYMENT_STATUS, STOCK_STATUS } from './types/status'
import type { OrderStatus, PaymentStatus } from './types/status'

const COLOR_SWATCHES = [
  { name: 'accent', varName: '--accent' },
  { name: 'accent-strong', varName: '--accent-strong' },
  { name: 'accent-soft', varName: '--accent-soft' },
  { name: 'success', varName: '--status-success' },
  { name: 'warning', varName: '--status-warning' },
  { name: 'progress', varName: '--status-progress' },
  { name: 'critical', varName: '--status-critical' },
  { name: 'info-soft', varName: '--status-info-soft' },
]

function DesignSystemPreview() {
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false)
  const [showOffersSection, setShowOffersSection] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(false)
  const [storeLanguage, setStoreLanguage] = useState('ar')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  return (
    <>
      <header className="preview-header">
        <h1>توا — معاينة نظام التصميم</h1>
        <Badge variant="info">نسخة تطويرية — المرحلتان 1 و2</Badge>
        <Badge variant="neutral" dot={false}>
          accent: أزرق التاجر
        </Badge>
      </header>

      <main className="preview-main">
        {/* ─── الأساس ─── */}
        <section className="preview-section" aria-labelledby="s-foundation">
          <h2 id="s-foundation">الأساس: الألوان والطباعة والاتجاه</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>أدوار الألوان الدلالية</h3>
              <div className="demo-row">
                {COLOR_SWATCHES.map((swatch) => (
                  <span className="swatch" key={swatch.name}>
                    <span className="swatch__chip" style={{ background: `var(${swatch.varName})` }} />
                    <span className="ltr">{swatch.name}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="demo-card">
              <h3>سلم الطباعة</h3>
              <div className="type-sample">
                <span className="t-display ltr">TW-2481-9X</span>
                <h1>عنوان الصفحة</h1>
                <h2>عنوان بطاقة</h2>
                <p>نص أساسي: متجرك جاهز لاستقبال الطلبات، وكل التغييرات تُحفظ فور اعتمادها.</p>
                <p className="t-caption">نص مساعد: تجد رقم الطلب في رسالة التأكيد.</p>
              </div>
            </div>
            <div className="demo-card">
              <h3>المحتوى مختلط الاتجاه</h3>
              <p>
                الإجمالي: <span className="numeric">1,250 د.ل</span>
              </p>
              <p>
                هاتف الزبون: <span className="ltr">+218 91 234 5678</span>
              </p>
              <p>
                رقم التتبع: <span className="numeric">TW-2481-9X</span>
              </p>
              <p>
                النطاق الفرعي: <span className="ltr">alafya.tawa.ly</span>
              </p>
            </div>
          </div>
        </section>

        {/* ─── الأزرار ─── */}
        <section className="preview-section" aria-labelledby="s-buttons">
          <h2 id="s-buttons">الأزرار</h2>
          <p className="preview-section__hint">أساسي واحد لكل شاشة — الثانوي والشبح للإجراءات المرافقة، والخطر للأفعال المدمرة فقط.</p>
          <div className="demo-card">
            <div className="demo-row">
              <Button variant="primary" icon={<PlusGlyph />}>
                منتج جديد
              </Button>
              <Button variant="secondary">حفظ كمسودة</Button>
              <Button variant="ghost">معاينة قبل النشر</Button>
              <Button variant="danger">إلغاء الطلب</Button>
            </div>
            <div className="demo-row">
              <Button variant="primary" loading>
                جارٍ الحفظ
              </Button>
              <Button variant="secondary" disabled>
                نشر المتجر (متطلبات ناقصة)
              </Button>
              <Button variant="primary" size="sm">
                نقل إلى: جاهز للتسليم
              </Button>
              <Button variant="secondary" size="sm">
                عرض
              </Button>
            </div>
            <div className="demo-row">
              <IconButton label="إجراءات الصف">
                <DotsGlyph />
              </IconButton>
              <IconButton label="حذف العنصر من السلة" variant="danger">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </IconButton>
              <Tooltip label="المحجوز يُقفل 15 دقيقة أثناء الشراء">
                <IconButton label="ما معنى المحجوز؟">
                  <InfoGlyph />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* ─── النماذج ─── */}
        <section className="preview-section" aria-labelledby="s-forms">
          <h2 id="s-forms">حقول النماذج</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>الأنواع والاتجاه</h3>
              <Input label="اسم المنتج" helperText="يظهر للزبائن في واجهة المتجر" defaultValue="شامبو أرغان 400مل" />
              <Input label="البريد الإلكتروني" type="email" defaultValue="fatima@example.ly" />
              <Input label="رقم الهاتف" type="tel" defaultValue="+218912345678" helperText="يُستخدم لتفعيل الحساب برمز OTP" />
              <Input label="السعر (د.ل)" type="number" defaultValue="45" />
              <Input label="رمز المنتج SKU" ltr optional defaultValue="SH-ARG-400" />
            </div>
            <div className="demo-card">
              <h3>الحالات</h3>
              <Input label="رقم الهاتف" type="tel" defaultValue="+218911111111" error="رقم الهاتف مستخدم مسبقاً — سجّل دخولك أو استخدم رقماً آخر" />
              <Input label="كلمة المرور" type="password" helperText="ثمانية أحرف على الأقل" />
              <Input label="النطاق الفرعي" ltr disabled defaultValue="alafya" helperText="تغيير النطاق يتطلب طلباً للإدارة" />
              <Select label="فئة المنتج" defaultValue="care">
                <option value="care">العناية بالشعر</option>
                <option value="skin">العناية بالبشرة</option>
                <option value="perfume">عطور</option>
              </Select>
              <Textarea label="وصف المنتج" optional helperText="وصف واضح يزيد ثقة المشتري" />
            </div>
          </div>
        </section>

        {/* ─── الاختيارات ─── */}
        <section className="preview-section" aria-labelledby="s-choices">
          <h2 id="s-choices">الاختيارات والمفاتيح</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>خانات الاختيار</h3>
              <Checkbox label="الموافقة على شروط الاستخدام" description="إلزامية لإنشاء حساب تاجر" defaultChecked />
              <Checkbox label="العناية بالشعر (تصنيف رئيسي)" defaultChecked />
              <Checkbox label="خيار معطّل" disabled />
            </div>
            <div className="demo-card">
              <h3>لغة المتجر الافتراضية</h3>
              <Radio
                name="store-language"
                label="العربية"
                description="واجهة RTL كاملة"
                value="ar"
                checked={storeLanguage === 'ar'}
                onChange={() => setStoreLanguage('ar')}
              />
              <Radio
                name="store-language"
                label="English"
                description="واجهة LTR — خارج نطاق المرحلة الحالية"
                value="en"
                checked={storeLanguage === 'en'}
                onChange={() => setStoreLanguage('en')}
              />
            </div>
            <div className="demo-card">
              <h3>مفاتيح فورية</h3>
              <Switch label="إظهار قسم العروض في الواجهة" checked={showOffersSection} onChange={setShowOffersSection} />
              <Switch label="تنبيهات انخفاض المخزون" checked={lowStockAlerts} onChange={setLowStockAlerts} />
              <Switch label="مفتاح معطّل" checked={false} onChange={() => undefined} disabled />
            </div>
          </div>
        </section>

        {/* ─── الشارات ─── */}
        <section className="preview-section" aria-labelledby="s-badges">
          <h2 id="s-badges">شارات الحالة — القواميس الموحدة</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>حالات الطلب (1.5.4)</h3>
              <div className="demo-row">
                {Object.entries(ORDER_STATUS).map(([key, meta]) => (
                  <Badge key={key} variant={meta.variant}>
                    {meta.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="demo-card">
              <h3>حالات المخزون (1.4.9 – 1.4.12)</h3>
              <div className="demo-row">
                {Object.entries(STOCK_STATUS).map(([key, meta]) => (
                  <Badge key={key} variant={meta.variant}>
                    {meta.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="demo-card">
              <h3>الدفع والاعتماد</h3>
              <div className="demo-row">
                {Object.entries(PAYMENT_STATUS).map(([key, meta]) => (
                  <Badge key={key} variant={meta.variant}>
                    {meta.label}
                  </Badge>
                ))}
              </div>
              <div className="demo-row">
                {Object.entries(APPROVAL_STATUS).map(([key, meta]) => (
                  <Badge key={key} variant={meta.variant}>
                    {meta.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── التنبيهات ─── */}
        <section className="preview-section" aria-labelledby="s-alerts">
          <h2 id="s-alerts">التنبيهات وToast</h2>
          <div className="demo-grid">
            <div className="demo-stack">
              <Alert variant="info" title="متجرك بانتظار اعتماد الإدارة">
                سنراجع بياناتك ونعلمك فور الاعتماد — يمكنك تجهيز منتجاتك في الأثناء.
              </Alert>
              <Alert variant="success" title="تم نشر المتجر">
                متجرك الآن مباشر على <span className="ltr">alafya.tawa.ly</span> ويستقبل الطلبات.
              </Alert>
            </div>
            <div className="demo-stack">
              <Alert
                variant="warning"
                title="انخفض مخزون «شامبو أرغان 400مل» عن الحد"
                action={
                  <Button variant="secondary" size="sm">
                    تعديل الكميات
                  </Button>
                }
              >
                الكمية المتاحة للبيع: <span className="numeric">3</span> فقط.
              </Alert>
              <Alert variant="error" title="تعذّر حفظ التغييرات">
                انقطع الاتصال أثناء الحفظ — أعد المحاولة، ولم يُفقد ما أدخلته.
              </Alert>
            </div>
            <div className="demo-card">
              <h3>Toast (نسخة عرضية محلية)</h3>
              <div className="demo-row">
                <Toast variant="success" message="تم حفظ المنتج" onClose={() => undefined} />
              </div>
              <div className="demo-row">
                <Toast
                  variant="neutral"
                  message="أُضيف إلى السلة"
                  action={
                    <Button variant="ghost" size="sm" style={{ color: 'var(--accent-soft)' }}>
                      إتمام الشراء
                    </Button>
                  }
                />
              </div>
              <div className="demo-row">
                <Button variant="secondary" onClick={() => setToastMessage('تم تحديث الكمية بنجاح')}>
                  إظهار Toast عائم
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── الطبقات العائمة ─── */}
        <section className="preview-section" aria-labelledby="s-overlays">
          <h2 id="s-overlays">الحوارات</h2>
          <p className="preview-section__hint">
            حوار عادي يُغلق بـ Esc وبنقر الخلفية — وحوار التأكيد المدمر لا يُغلق بالخلفية، سببه إلزامي، وتركيزه الابتدائي على «تراجع».
          </p>
          <div className="demo-card">
            <div className="demo-row">
              <Button variant="secondary" onClick={() => setPreviewModalOpen(true)}>
                فتح حوار عادي
              </Button>
              <Button variant="danger" onClick={() => setCancelOrderOpen(true)}>
                إلغاء الطلب <span className="numeric">#2481</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── الحالات ─── */}
        <section className="preview-section" aria-labelledby="s-states">
          <h2 id="s-states">حالات الشاشات</h2>
          <div className="demo-grid">
            <div className="demo-card">
              <h3>هياكل التحميل (Skeleton)</h3>
              <div className="demo-row">
                <Skeleton variant="circle" width={40} height={40} />
                <div style={{ flex: 1, display: 'grid', gap: 'var(--space-sm)' }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="45%" />
                </div>
              </div>
              <Skeleton variant="rect" width="100%" height={96} />
              <LoadingState label="جارٍ تحميل الطلبات…" />
            </div>
            <div className="demo-card">
              <EmptyState
                title="ابدأ بإضافة أول منتج"
                description="متجرك لا يحتوي منتجات بعد — أضف منتجك الأول ليظهر للزبائن فور النشر."
                action={
                  <Button variant="primary" icon={<PlusGlyph />}>
                    منتج جديد
                  </Button>
                }
              />
            </div>
            <div className="demo-card">
              <ErrorState onRetry={() => setToastMessage('تمت إعادة المحاولة')} />
            </div>
            <div className="demo-card">
              <PermissionDeniedState />
            </div>
          </div>
        </section>

        {/* ─── المرحلة 2: الهيكل والملاحة ─── */}
        <section className="preview-section" aria-labelledby="s-shells">
          <h2 id="s-shells">هيكل التطبيق (AppShell) — بيانات معاينة ثابتة</h2>
          <p className="preview-section__hint">
            الهيكل يستجيب لعرض إطاره لا لعرض النافذة: الإطار الضيق أدناه يُظهر زر درج الملاحة، وضيّق النافذة لرؤية السلوك نفسه في
            الإطارات العريضة. هذه معاينة مكونات — ليست لوحة توا فعلية.
          </p>
          <ShellsDemo />
        </section>

        <section className="preview-section" aria-labelledby="s-nav">
          <h2 id="s-nav">ترويسة الصفحة والمسار والتبويبات والقائمة الجانبية</h2>
          <NavigationDemo />
        </section>

        <section className="preview-section" aria-labelledby="s-data">
          <h2 id="s-data">البحث والفلاتر وجدول البيانات والترقيم — بيانات معاينة ثابتة</h2>
          <TableDemo />
        </section>

        <section className="preview-section" aria-labelledby="s-metrics">
          <h2 id="s-metrics">بطاقات المؤشرات وقائمة مفتاح-قيمة — بيانات معاينة ثابتة</h2>
          <MetricsDemo />
        </section>
      </main>

      <Modal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="تفاصيل المتغير"
        footer={
          <>
            <Button variant="primary" onClick={() => setPreviewModalOpen(false)}>
              حفظ
            </Button>
            <Button variant="secondary" onClick={() => setPreviewModalOpen(false)}>
              إلغاء
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          <p>
            المتغير: أحمر / M — المتاح للبيع <span className="numeric">18</span> (الكلي <span className="numeric">20</span> −
            المحجوز <span className="numeric">2</span>).
          </p>
          <Input label="الكمية الجديدة" type="number" defaultValue="20" helperText="سبب التعديل يُسجل في سجل المخزون" />
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelOrderOpen}
        title="إلغاء الطلب #2481"
        impact="سيُلغى الطلب نهائياً وسيُرجع النظام الكميات المحجوزة إلى المخزون تلقائياً."
        confirmLabel="إلغاء الطلب"
        requireReason
        reasonLabel="سبب الإلغاء"
        onConfirm={() => {
          setCancelOrderOpen(false)
          setToastMessage('أُلغي الطلب وأُرجعت الكميات للمخزون')
        }}
        onCancel={() => setCancelOrderOpen(false)}
      />

      {toastMessage && <Toast variant="success" message={toastMessage} floating onClose={() => setToastMessage(null)} />}
    </>
  )
}

/* ═══════════════ أقسام المرحلة 2 — مكونات عرض داخلية ═══════════════ */

/* بيانات معاينة ثابتة — للعرض البصري فقط، ليست بيانات فعلية */

interface PreviewOrder {
  id: string
  customer: string
  phone: string
  total: string
  payment: PaymentStatus
  status: OrderStatus
}

const PREVIEW_ORDERS: readonly PreviewOrder[] = [
  { id: 'TW-2481-9X', customer: 'فاطمة إدريس', phone: '+218 91 234 5678', total: '173 د.ل', payment: 'paid', status: 'preparing' },
  { id: 'TW-2480-4K', customer: 'محمد الشريف', phone: '+218 92 111 2233', total: '45 د.ل', payment: 'cod', status: 'confirmed' },
  { id: 'TW-2479-7M', customer: 'سالم بن عامر', phone: '+218 94 555 8899', total: '260 د.ل', payment: 'cod', status: 'ready' },
  { id: 'TW-2478-2B', customer: 'آمنة الفيتوري', phone: '+218 91 777 4455', total: '89 د.ل', payment: 'paid', status: 'delivered' },
]

const ORDER_COLUMNS: ReadonlyArray<DataTableColumn<PreviewOrder>> = [
  { key: 'id', header: 'رقم الطلب', numeric: true, sortable: true, cell: (row) => row.id },
  { key: 'customer', header: 'الزبون', cell: (row) => row.customer },
  { key: 'phone', header: 'الهاتف', cell: (row) => <span className="ltr">{row.phone}</span> },
  { key: 'total', header: 'الإجمالي', numeric: true, sortable: true, cell: (row) => row.total },
  {
    key: 'payment',
    header: 'الدفع',
    cell: (row) => <Badge variant={PAYMENT_STATUS[row.payment].variant}>{PAYMENT_STATUS[row.payment].label}</Badge>,
  },
  {
    key: 'status',
    header: 'الحالة',
    cell: (row) => <Badge variant={ORDER_STATUS[row.status].variant}>{ORDER_STATUS[row.status].label}</Badge>,
  },
]

function buildMerchantGroups(activeKey: string, onSelect: (key: string) => void): SidebarGroup[] {
  const item = (key: string, label: string, icon: ReactNode, count?: number, disabled?: boolean) => ({
    key,
    label,
    icon,
    count,
    disabled,
    active: key === activeKey,
    onSelect,
  })
  return [
    {
      title: 'التشغيل',
      items: [
        item('home', 'الرئيسية', <HomeGlyph />),
        item('orders', 'الطلبات', <OrdersGlyph />, 8),
        item('products', 'المنتجات', <TagGlyph />),
        item('inventory', 'المخزون', <LayersGlyph />, 3),
      ],
    },
    {
      title: 'المتجر',
      items: [
        item('appearance', 'المظهر والقوالب', <GearGlyph />),
        item('team', 'فريق العمل', <UsersGlyph />, undefined, true),
        item('settings', 'الإعدادات', <GearGlyph />),
      ],
    },
  ]
}

function buildAdminGroups(activeKey: string, onSelect: (key: string) => void): SidebarGroup[] {
  return [
    {
      title: 'الطوابير',
      items: [
        { key: 'home', label: 'الرئيسية', icon: <HomeGlyph />, active: activeKey === 'home', onSelect },
        { key: 'approvals', label: 'طلبات الاعتماد', icon: <ShieldGlyph />, count: 5, active: activeKey === 'approvals', onSelect },
        { key: 'moderation', label: 'فحص المنتجات', icon: <TagGlyph />, count: 12, active: activeKey === 'moderation', onSelect },
      ],
    },
    {
      title: 'الإدارة',
      items: [
        { key: 'stores', label: 'المتاجر', icon: <LayersGlyph />, active: activeKey === 'stores', onSelect },
        { key: 'plans', label: 'باقات الاشتراك', icon: <OrdersGlyph />, active: activeKey === 'plans', onSelect },
        { key: 'audit', label: 'سجل التدقيق', icon: <ScrollGlyph />, active: activeKey === 'audit', onSelect },
      ],
    },
  ]
}

function MerchantBrand() {
  return (
    <div>
      <p style={{ fontWeight: 700 }}>متجر العافية</p>
      <p className="ltr" style={{ fontSize: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        alafya.tawa.ly
      </p>
    </div>
  )
}

function ShellsDemo() {
  const [merchantActive, setMerchantActive] = useState('home')
  const [adminActive, setAdminActive] = useState('approvals')
  const [mobileActive, setMobileActive] = useState('orders')

  return (
    <div className="demo-stack">
      <div className="shell-frame">
        <AppShell
          context="merchant"
          sidebar={<Sidebar brand={<MerchantBrand />} groups={buildMerchantGroups(merchantActive, setMerchantActive)} />}
          topbar={
            <Topbar
              title="لوحة التاجر"
              storeContext={
                <>
                  متجر العافية — <span className="ltr">alafya.tawa.ly</span>
                </>
              }
              userName="فاطمة"
              actions={
                <Button variant="primary" size="sm">
                  + منتج جديد
                </Button>
              }
            />
          }
        >
          <PageHeader
            as="h3"
            title="الرئيسية"
            description="نظرة عامة على متجرك اليوم"
            meta={<Badge variant="success">المتجر منشور</Badge>}
          />
          <div className="summary-grid">
            <SummaryCard label="طلبات جديدة" value={<span className="numeric">8</span>} change="آخر طلب قبل 25 دقيقة" />
            <SummaryCard
              label="مخزون منخفض"
              value={<span className="numeric">3</span>}
              tone="warning"
              change="3 منتجات تحت حد التنبيه"
            />
          </div>
        </AppShell>
      </div>

      <div className="shell-frame">
        <AppShell
          context="admin"
          sidebar={<Sidebar brand={<p style={{ fontWeight: 700 }}>توا — إدارة المنصة</p>} groups={buildAdminGroups(adminActive, setAdminActive)} />}
          topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
        >
          <PageHeader
            as="h3"
            title="طلبات الاعتماد"
            meta={<Badge variant="warning">5 بانتظار المراجعة</Badge>}
            description="راجع طلبات انضمام التجار الجدد ووثائقهم"
          />
          <Alert variant="warning" title="طلبان تجاوزا يومين في الانتظار">
            أقدم طلب معلّق: «مكتبة الأندلس» — قُدّم قبل 3 أيام.
          </Alert>
        </AppShell>
      </div>

      <div className="demo-row" style={{ alignItems: 'stretch' }}>
        <div className="shell-frame shell-frame--mobile" style={{ flex: '1 1 300px' }}>
          <AppShell
            context="merchant"
            sidebar={<Sidebar brand={<MerchantBrand />} groups={buildMerchantGroups(mobileActive, setMobileActive)} />}
            topbar={<Topbar title="لوحة التاجر" userName="فاطمة" />}
          >
            <PageHeader as="h3" title="الطلبات" meta={<Badge variant="info">8 جديدة</Badge>} />
            <p className="preview-section__hint">إطار ضيق (390px) — زر الدرج أعلى اليمين يفتح قائمة التنقل.</p>
          </AppShell>
        </div>

        <div className="shell-frame shell-frame--mobile" style={{ flex: '1 1 300px', maxWidth: 480 }}>
          <AppShell context="storefront" topbar={<Topbar title="متجر العافية" actions={<Button variant="ghost" size="sm">تتبع طلبي</Button>} />}>
            <p className="preview-section__hint">
              سياق الستورفرونت: بلا قائمة جانبية، وaccent يبقى افتراضياً — صبغه بلون التاجر معلّق على قرار D6.
            </p>
          </AppShell>
        </div>
      </div>
    </div>
  )
}

function NavigationDemo() {
  const [tab, setTab] = useState('all')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="demo-stack">
      <div className="demo-card">
        <h3>PageHeader مع Breadcrumbs</h3>
        <PageHeader
          as="h3"
          title="شامبو أرغان 400مل"
          description="عدّل بيانات المنتج ومتغيراته ومخزونه"
          meta={<Badge variant="neutral">مسودة</Badge>}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: 'الرئيسية', onSelect: () => undefined },
                { label: 'المنتجات', onSelect: () => undefined },
                { label: 'شامبو أرغان 400مل' },
              ]}
            />
          }
          primaryAction={<Button variant="primary">حفظ المنتج</Button>}
          secondaryActions={<Button variant="secondary">معاينة بالمتجر</Button>}
        />
      </div>

      <div className="demo-card">
        <h3>تبويبات بعدّادات (لوحة المفاتيح: الأسهم وHome/End)</h3>
        <Tabs
          label="حالات الطلبات"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'الكل', count: 46 },
            { key: 'new', label: 'جديدة', count: 8 },
            { key: 'preparing', label: 'قيد التجهيز', count: 5 },
            { key: 'ready', label: 'جاهزة', count: 3 },
            { key: 'cancelled', label: 'ملغاة', disabled: true },
          ]}
        />
        <p className="preview-section__hint">التبويب النشط: {tab}</p>
      </div>

      <div className="demo-card">
        <h3>القائمة الجانبية مستقلة — وضع مطوٍ (Rail)</h3>
        <div className="demo-row">
          <Switch label="طي القائمة (تبقى التسميات للقارئات وTooltip النظام)" checked={collapsed} onChange={setCollapsed} />
        </div>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', overflow: 'hidden', height: 320, display: 'inline-block' }}>
          <Sidebar collapsed={collapsed} brand={<MerchantBrand />} groups={buildMerchantGroups('products', () => undefined)} />
        </div>
      </div>
    </div>
  )
}

type TableDemoView = 'data' | 'loading' | 'empty' | 'error'

function TableDemo() {
  const [view, setView] = useState<TableDemoView>('data')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(2)
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(new Set())
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>({ key: 'id', direction: 'desc' })

  return (
    <div className="demo-stack">
      <Tabs
        label="حالة الجدول المعروضة"
        value={view}
        onChange={(key) => setView(key as TableDemoView)}
        items={[
          { key: 'data', label: 'ببيانات', count: PREVIEW_ORDERS.length },
          { key: 'loading', label: 'تحميل' },
          { key: 'empty', label: 'فارغ' },
          { key: 'error', label: 'خطأ' },
        ]}
      />

      <FilterBar
        search={<SearchField label="بحث في الطلبات" value={search} onChange={setSearch} placeholder="رقم الطلب أو اسم الزبون…" />}
        filters={
          <Select label="حالة الطلب" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">الكل</option>
            {Object.entries(ORDER_STATUS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
        }
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
            }}
          >
            مسح الفلاتر
          </Button>
        }
      />

      {selectedKeys.size > 0 && (
        <Alert variant="info" title={`تم تحديد ${selectedKeys.size} من الطلبات`}>
          شريط الإجراءات الجماعية يُبنى في مرحلة الشاشات الفعلية.
        </Alert>
      )}

      <DataTable
        caption="جدول طلبات — بيانات معاينة ثابتة"
        columns={ORDER_COLUMNS}
        rows={view === 'data' ? PREVIEW_ORDERS : []}
        rowKey={(row) => row.id}
        loading={view === 'loading'}
        error={view === 'error' ? 'انقطع الاتصال أثناء جلب الطلبات.' : undefined}
        onRetry={() => setView('data')}
        emptyState={
          <EmptyState
            title="لا توجد طلبات مطابقة"
            description="جرّب تعديل كلمات البحث أو امسح الفلاتر."
            action={
              <Button variant="secondary" onClick={() => setView('data')}>
                مسح الفلاتر
              </Button>
            }
          />
        }
        sort={sort}
        onSortChange={(key) =>
          setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }))
        }
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      />

      <Pagination page={page} pageCount={7} onPageChange={setPage} disabled={view !== 'data'} />
    </div>
  )
}

function MetricsDemo() {
  return (
    <div className="demo-stack">
      <div className="summary-grid">
        <SummaryCard
          label="مبيعات اليوم"
          value={<span className="numeric">1,250 د.ل</span>}
          tone="positive"
          change="ارتفاع 12% عن أمس"
          icon={<OrdersGlyph />}
        />
        <SummaryCard label="طلبات جديدة" value={<span className="numeric">8</span>} change="آخر طلب قبل 25 دقيقة" icon={<OrdersGlyph />} />
        <SummaryCard
          label="مخزون منخفض"
          value={<span className="numeric">3</span>}
          tone="warning"
          change="3 منتجات تحت حد التنبيه"
          icon={<LayersGlyph />}
        />
        <SummaryCard
          label="طلبات ملغاة هذا الأسبوع"
          value={<span className="numeric">1</span>}
          tone="negative"
          change="انخفاض مقابل الأسبوع الماضي"
          icon={<TagGlyph />}
        />
      </div>

      <div className="demo-card" style={{ maxWidth: 520 }}>
        <h3>تفاصيل الطلب TW-2481-9X (قائمة مفتاح-قيمة)</h3>
        <KeyValueList
          items={[
            { label: 'الزبون', value: 'فاطمة إدريس' },
            { label: 'رقم الهاتف', value: '+218 91 234 5678', ltr: true },
            { label: 'رقم التتبع', value: 'TW-2481-9X', numeric: true },
            { label: 'طريقة الدفع', value: PAYMENT_STATUS.paid.label },
            { label: 'الإجمالي', value: '173 د.ل', numeric: true },
            { label: 'مكان الاستلام', value: 'طرابلس — حي الأندلس، شارع الجمهورية' },
          ]}
        />
      </div>
    </div>
  )
}

/* ═══════════════ جذر التطبيق — مبدّل عرض تطويري ═══════════════ */

type DevScreen = 'dashboard' | 'products' | 'preview'

const DEV_SCREENS: ReadonlyArray<{ key: DevScreen; label: string }> = [
  { key: 'dashboard', label: 'لوحة التاجر — نظرة عامة' },
  { key: 'products', label: 'لوحة التاجر — المنتجات' },
  { key: 'preview', label: 'معاينة نظام التصميم' },
]

export default function App() {
  const [screen, setScreen] = useState<DevScreen>('dashboard')

  return (
    <div className="dev-root">
      <div className="dev-bar">
        <span>عرض تطويري:</span>
        {DEV_SCREENS.map((item) => (
          <Button
            key={item.key}
            size="sm"
            variant={screen === item.key ? 'primary' : 'secondary'}
            aria-pressed={screen === item.key}
            onClick={() => setScreen(item.key)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="dev-content">
        {screen === 'dashboard' ? <MerchantDashboardOverview /> : screen === 'products' ? <MerchantProductsList /> : <DesignSystemPreview />}
      </div>
    </div>
  )
}
