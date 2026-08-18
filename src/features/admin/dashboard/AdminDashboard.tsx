import { useState } from 'react'
import { useNavigate } from 'react-router'
import '../admin.css'
import './admin-dashboard.css'
import {
  Alert,
  AppShell,
  AttentionList,
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  ErrorState,
  PageHeader,
  Radio,
  Skeleton,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { APPROVAL_STATUS } from '../../../types/status'
import { AdminSidebar } from '../AdminSidebar'
import { ADMIN_METRICS, ATTENTION_ITEMS, RECENT_AUDIT, RECENT_STORES } from './mock-data'
import type { RecentStore } from './mock-data'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

const STORE_COLUMNS: ReadonlyArray<DataTableColumn<RecentStore>> = [
  { key: 'store', header: 'المتجر', cell: (row) => <span style={{ fontWeight: 600 }}>{row.storeName}</span> },
  { key: 'merchant', header: 'التاجر', cell: (row) => row.merchantName },
  { key: 'subdomain', header: 'النطاق الفرعي', cell: (row) => <span className="ltr">{row.subdomain}</span> },
  { key: 'date', header: 'تاريخ التسجيل', cell: (row) => row.registeredAt },
  {
    key: 'status',
    header: 'الحالة',
    cell: (row) => <Badge variant={APPROVAL_STATUS[row.status].variant}>{APPROVAL_STATUS[row.status].label}</Badge>,
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [view, setView] = useState<ScreenView>('normal')

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<AdminSidebar active="overview" />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title="الرئيسية"
        description="نظرة على حالة المنصة وطوابير العمل التي تحتاج قراراً إدارياً"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="adash-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <>
          <div className="adash-metrics" aria-hidden="true">
            {ADMIN_METRICS.map((metric) => (
              <Skeleton key={metric.key} variant="rect" height={104} />
            ))}
          </div>
          <div className="admin-columns" aria-hidden="true">
            <Skeleton variant="rect" height={280} />
            <Skeleton variant="rect" height={200} />
          </div>
        </>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState
            description="تعذّر تحميل مؤشرات المنصة — تحقق من اتصالك ثم أعد المحاولة."
            onRetry={() => setView('normal')}
          />
        </div>
      ) : (
        <>
          <section className="tw-metrics" aria-label="مؤشرات المنصة">
            {ADMIN_METRICS.map((metric) => (
              <div className={`tw-metric${metric.tone === 'warning' ? ' tw-metric--warning' : ''}`} key={metric.key}>
                <span className="tw-metric__label">{metric.label}</span>
                <span className="tw-metric__value numeric">{metric.value}</span>
                {metric.change && <span className="tw-metric__hint">{metric.change}</span>}
              </div>
            ))}
          </section>

          <div className="admin-columns">
            <div style={{ display: 'grid', gap: 'var(--space-xl)', minWidth: 0 }}>
              <section style={{ display: 'grid', gap: 'var(--space-md)', minWidth: 0 }} aria-labelledby="adash-attention">
                <h2 id="adash-attention">يحتاج انتباهك</h2>
                {/* نمط توا الموحد (توقيع ٢) — الأفعال تتنقل فعلاً */}
                <AttentionList
                  items={ATTENTION_ITEMS.map((item) => ({
                    id: item.key,
                    severity: item.severity,
                    title: item.label,
                    why: item.why,
                    actionLabel: item.actionLabel,
                    onAction: () => navigate(item.to),
                  }))}
                />
              </section>

              <section style={{ display: 'grid', gap: 'var(--space-md)', minWidth: 0 }} aria-labelledby="adash-stores">
                <div className="adash-section-head">
                  <h2 id="adash-stores">آخر المتاجر المسجلة</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/admin/stores')}>
                    عرض كل المتاجر
                  </Button>
                </div>
                <DataTable
                  caption="أحدث المتاجر المسجلة بحالاتها — بيانات تجريبية للعرض"
                  columns={STORE_COLUMNS}
                  rows={RECENT_STORES}
                  rowKey={(row) => row.id}
                />
              </section>
            </div>

            <section className="admin-card" aria-labelledby="adash-audit">
              <h2 id="adash-audit">أحدث عمليات التدقيق</h2>
              <ul className="adash-audit">
                {RECENT_AUDIT.map((entry) => (
                  <li className={`adash-audit__item adash-audit__item--${entry.tone}`} key={entry.id}>
                    <span>{entry.description}</span>
                    <span className="adash-audit__time">{entry.time}</span>
                  </li>
                ))}
              </ul>
              <Alert variant="info" title="سجل التدقيق للقراءة فقط">
                يسجّل العمليات الحساسة على المنصة (م.1.3.13) — الشاشة الكاملة تُبنى في مرحلة قادمة.
              </Alert>
            </section>
          </div>
        </>
      )}
    </AppShell>
  )
}
