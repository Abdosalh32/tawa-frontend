import { useEffect, useMemo, useState } from 'react'
import '../admin.css'
import './approvals.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  KeyValueList,
  PageHeader,
  Radio,
  Skeleton,
  Tabs,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { ScrollGlyph } from '../../../components/ui/icons'
import { APPROVAL_STATUS } from '../../../types/status'
import { AdminSidebar } from '../AdminSidebar'
import { APPROVAL_REQUESTS } from './mock-data'
import type { ApprovalRequest } from './mock-data'

type QueueTab = 'pending' | 'rejected' | 'approved'

/** التبويبات من الحالات الموثقة فقط (م.1.3.1 – م.1.3.3) */
const TAB_META: ReadonlyArray<{ key: QueueTab; label: string }> = [
  { key: 'pending', label: 'بانتظار المراجعة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'approved', label: 'معتمدة' },
]

/** حالة عرض تطويرية محلية — الافتراضي «الطابور» */
type ScreenView = 'queue' | 'review' | 'empty' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'queue', label: 'الطابور (الافتراضية)' },
  { value: 'review', label: 'شاشة المراجعة' },
  { value: 'empty', label: 'طابور فارغ' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

type LocalDecision = { status: 'approved' } | { status: 'rejected'; reason: string }

export function AdminApprovals() {
  const [view, setView] = useState<ScreenView>('queue')
  const [tab, setTab] = useState<QueueTab>('pending')
  /** قرارات محلية فوق البيانات التجريبية — لا اعتماد ولا رفض فعلياً */
  const [decisions, setDecisions] = useState<Record<string, LocalDecision>>({})
  const [reviewingId, setReviewingId] = useState<string>(APPROVAL_REQUESTS[0].id)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  /** دمج القرارات المحلية مع البيانات الأصلية */
  const requests = useMemo(
    () =>
      APPROVAL_REQUESTS.map((request) => {
        const decision = decisions[request.id]
        if (!decision) return request
        return decision.status === 'approved'
          ? { ...request, status: 'approved' as const, rejectionReason: undefined }
          : { ...request, status: 'rejected' as const, rejectionReason: decision.reason }
      }),
    [decisions],
  )

  const countOf = (status: QueueTab) => requests.filter((request) => request.status === status).length
  const rows = requests.filter((request) => request.status === tab)
  const reviewing = requests.find((request) => request.id === reviewingId) ?? requests[0]

  const openReview = (id: string) => {
    setReviewingId(id)
    setView('review')
  }

  const columns: ReadonlyArray<DataTableColumn<ApprovalRequest>> = [
    {
      key: 'merchant',
      header: 'التاجر',
      cell: (row) => (
        <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
          <span style={{ fontWeight: 600 }}>{row.merchantName}</span>
          <span className="ltr" style={{ fontSize: 'var(--type-caption)', color: 'var(--text-secondary)' }}>
            {row.merchantPhone}
          </span>
        </span>
      ),
    },
    { key: 'store', header: 'اسم المتجر المطلوب', cell: (row) => row.requestedStoreName },
    { key: 'subdomain', header: 'النطاق المطلوب', cell: (row) => <span className="ltr">{row.requestedSubdomain}</span> },
    {
      key: 'submitted',
      header: 'تاريخ التقديم',
      cell: (row) => (
        <span className={row.ageDays >= 2 && row.status === 'pending' ? 'appr-age appr-age--late' : 'appr-age'}>
          {row.submittedAt}
          {row.status === 'pending' && row.ageDays >= 2 && (
            <>
              {' '}
              — منذ <span className="numeric">{row.ageDays}</span> أيام
            </>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) => <Badge variant={APPROVAL_STATUS[row.status].variant}>{APPROVAL_STATUS[row.status].label}</Badge>,
    },
    {
      key: 'action',
      header: 'الإجراء',
      cell: (row) => (
        <Button variant="secondary" size="sm" aria-label={`مراجعة طلب ${row.merchantName}`} onClick={() => openReview(row.id)}>
          مراجعة
        </Button>
      ),
    },
  ]

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<AdminSidebar active="approvals" />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title={view === 'review' ? 'مراجعة طلب اعتماد' : 'طلبات الاعتماد'}
        description="اعتماد التاجر يفعّل حسابه رسمياً ويتيح له نشر متجره؛ الرفض يتطلب سبباً يظهر له ليصحّح ويعيد التقديم"
        meta={view !== 'review' && <Badge variant="warning">{countOf('pending')} بانتظار المراجعة</Badge>}
        breadcrumbs={
          <Breadcrumbs
            items={
              view === 'review'
                ? [{ label: 'الرئيسية' }, { label: 'طلبات الاعتماد', onSelect: () => setView('queue') }, { label: 'مراجعة الطلب' }]
                : [{ label: 'الرئيسية' }, { label: 'طلبات الاعتماد' }]
            }
          />
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (قرارات محلية على بيانات تجريبية، لا اعتماد ولا رفض فعلياً)</legend>
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
          {Object.keys(decisions).length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setDecisions({})}>
              إعادة ضبط القرارات المحلية
            </Button>
          )}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <Skeleton variant="rect" height={44} />
          <Skeleton variant="rect" height={260} />
        </div>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState
            description="تعذّر جلب طلبات الاعتماد — تحقق من اتصالك ثم أعد المحاولة."
            onRetry={() => setView('queue')}
          />
        </div>
      ) : view === 'review' ? (
        <>
          <div className="admin-card">
            <div className="arev-head">
              <span className="arev-head__name">{reviewing.merchantName}</span>
              <Badge variant={APPROVAL_STATUS[reviewing.status].variant}>{APPROVAL_STATUS[reviewing.status].label}</Badge>
              <span className="arev-head__time">قُدّم {reviewing.submittedAt}</span>
            </div>
            {reviewing.status === 'rejected' && reviewing.rejectionReason && (
              <Alert variant="error" title="سبب الرفض المُسجَّل (يظهر للتاجر ليصحّح ويعيد التقديم)">
                {reviewing.rejectionReason}
              </Alert>
            )}
            {reviewing.status === 'approved' && (
              <Alert variant="success" title="هذا الطلب معتمد">
                حساب التاجر مفعّل رسمياً ويمكنه نشر متجره بعد استيفاء متطلبات النشر (1.2.4).
              </Alert>
            )}
          </div>

          <div className="admin-columns">
            <div style={{ display: 'grid', gap: 'var(--space-xl)', minWidth: 0 }}>
              <section className="admin-card" aria-labelledby="arev-merchant">
                <h2 id="arev-merchant">بيانات التاجر</h2>
                <KeyValueList
                  items={[
                    { label: 'الاسم الكامل', value: reviewing.merchantName },
                    { label: 'رقم الهاتف', value: reviewing.merchantPhone, ltr: true },
                    { label: 'البريد الإلكتروني', value: reviewing.merchantEmail, ltr: true },
                  ]}
                />
              </section>

              <section className="admin-card" aria-labelledby="arev-store">
                <h2 id="arev-store">بيانات المتجر المطلوب</h2>
                <KeyValueList
                  items={[
                    { label: 'اسم المتجر', value: reviewing.requestedStoreName },
                    { label: 'فئة النشاط', value: reviewing.requestedCategory },
                    { label: 'النطاق الفرعي المطلوب', value: reviewing.requestedSubdomain, ltr: true },
                  ]}
                />
                <p className="admin-note">
                  الباقة المختارة غير معروضة: كيف يختار التاجر باقته قرار منتج مفقود (M2) — تُضاف بعد حسمه.
                </p>
              </section>
            </div>

            <section className="admin-card" aria-labelledby="arev-docs-title">
              <h2 id="arev-docs-title">الوثائق المرفوعة</h2>
              <Badge variant="warning">مؤجل — بانتظار قرار المنتج (D3)</Badge>
              <div className="arev-docs">
                {['السجل التجاري', 'إثبات الهوية'].map((label) => (
                  <div className="arev-doc" key={label}>
                    <ScrollGlyph />
                    <span>{label}</span>
                    <span>لا عارض وثائق بعد</span>
                  </div>
                ))}
              </div>
              <p className="admin-note">
                مراجعة الوثائق جوهر هذه الشاشة (م.1.3.1)، لكن الوثائق المطلوبة وموضع رفعها في مسار التسجيل غير محسومين
                (D3) — لذا Placeholder موسوم بلا عارض ولا رفع.
              </p>
            </section>
          </div>

          {reviewing.status === 'pending' && (
            <div className="arev-decision">
              <Button variant="primary" onClick={() => setApproveOpen(true)}>
                اعتماد وتفعيل
              </Button>
              <Button variant="danger" onClick={() => setRejectOpen(true)}>
                رفض الطلب
              </Button>
              <Button variant="ghost" onClick={() => setView('queue')}>
                العودة للطابور
              </Button>
              <span className="arev-decision__note">تُسجَّل العملية في سجل التدقيق (م.1.3.13) — معاينة محلية</span>
            </div>
          )}
        </>
      ) : (
        <>
          <Tabs
            label="تصفية طلبات الاعتماد"
            value={tab}
            onChange={(key) => setTab(key as QueueTab)}
            items={TAB_META.map((item) => ({ key: item.key, label: item.label, count: countOf(item.key) }))}
          />
          <DataTable
            caption="طلبات انضمام التجار الجدد — بيانات تجريبية للعرض"
            columns={columns}
            rows={view === 'empty' ? [] : rows}
            rowKey={(row) => row.id}
            emptyState={
              tab === 'pending' ? (
                <EmptyState title="أنجزت كل المراجعات" description="لا طلبات اعتماد معلّقة الآن — سيظهر أي طلب جديد هنا فوراً." />
              ) : (
                <EmptyState title="لا طلبات في هذا التبويب" />
              )
            }
          />
        </>
      )}

      <ConfirmDialog
        open={approveOpen}
        title={`اعتماد وتفعيل حساب ${reviewing.merchantName}`}
        impact={`سيُفعَّل حساب التاجر رسمياً ويصبح بإمكانه نشر متجر «${reviewing.requestedStoreName}» بعد استيفاء متطلبات النشر — التفعيل الفعلي مع الربط الخلفي (معاينة محلية).`}
        confirmLabel="اعتماد وتفعيل"
        onConfirm={() => {
          setApproveOpen(false)
          setDecisions((prev) => ({ ...prev, [reviewing.id]: { status: 'approved' } }))
          setToast(`اعتُمد حساب ${reviewing.merchantName} (معاينة محلية — لا تفعيل فعلياً)`)
          setView('queue')
        }}
        onCancel={() => setApproveOpen(false)}
      />

      <ConfirmDialog
        open={rejectOpen}
        title={`رفض طلب ${reviewing.merchantName}`}
        impact="سيظهر السبب للتاجر ليصحّح ويعيد التقديم (م.1.3.3) — الرفض الفعلي وإشعار التاجر مع الربط الخلفي (معاينة محلية)."
        confirmLabel="رفض الطلب"
        requireReason
        reasonLabel="سبب الرفض"
        onConfirm={(reason) => {
          setRejectOpen(false)
          setDecisions((prev) => ({ ...prev, [reviewing.id]: { status: 'rejected', reason: reason ?? '' } }))
          setToast(`رُفض طلب ${reviewing.merchantName} مع تسجيل السبب (معاينة محلية)`)
          setView('queue')
        }}
        onCancel={() => setRejectOpen(false)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
