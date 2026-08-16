import { useEffect, useState } from 'react'
import './styles/preview.css'
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  Input,
  LoadingState,
  Modal,
  PermissionDeniedState,
  Radio,
  Select,
  Skeleton,
  Switch,
  Textarea,
  Toast,
  Tooltip,
} from './components/ui'
import { APPROVAL_STATUS, ORDER_STATUS, PAYMENT_STATUS, STOCK_STATUS } from './types/status'

/* أيقونات المعاينة (خطية 2px) */

function PlusGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  )
}

function DotsGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  )
}

function InfoGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3M8 5v.5" />
    </svg>
  )
}

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

export default function App() {
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
        <Badge variant="info">نسخة تطويرية — المرحلة 1</Badge>
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
