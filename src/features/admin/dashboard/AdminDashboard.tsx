import { useState } from 'react'
import '../admin.css'
import './admin-dashboard.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  ErrorState,
  PageHeader,
  Radio,
  Sidebar,
  Skeleton,
  SummaryCard,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { APPROVAL_STATUS } from '../../../types/status'
import { AdminBrand } from '../AdminBrand'
import { buildAdminNav } from '../admin-nav'
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
  const [view, setView] = useState<ScreenView>('normal')

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<Sidebar brand={<AdminBrand />} groups={buildAdminNav('overview')} />}
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
          <div className="adash-metrics">
            {ADMIN_METRICS.map((metric) => (
              <SummaryCard
                key={metric.key}
                label={metric.label}
                value={<span className="numeric">{metric.value}</span>}
                tone={metric.tone}
                change={metric.change}
              />
            ))}
          </div>

          <div className="admin-columns">
            <div style={{ display: 'grid', gap: 'var(--space-xl)', minWidth: 0 }}>
              <section className="admin-card" aria-labelledby="adash-attention">
                <h2 id="adash-attention">يحتاج انتباهك</h2>
                <ul className="adash-attention">
                  {ATTENTION_ITEMS.map((item) => (
                    <li className="adash-attention__item" key={item.key}>
                      <span className="adash-attention__text">
                        <Badge
                          variant={item.tone === 'negative' ? 'error' : item.tone === 'warning' ? 'warning' : 'neutral'}
                          dot={false}
                        >
                          {item.tone === 'negative' ? 'عالي' : item.tone === 'warning' ? 'متوسط' : 'عادي'}
                        </Badge>
                        {item.label}
                      </span>
                      <Button variant="secondary" size="sm">
                        {item.actionLabel}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>

              <section style={{ display: 'grid', gap: 'var(--space-md)', minWidth: 0 }} aria-labelledby="adash-stores">
                <div className="adash-section-head">
                  <h2 id="adash-stores">آخر المتاجر المسجلة</h2>
                  <Button variant="ghost" size="sm">
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
