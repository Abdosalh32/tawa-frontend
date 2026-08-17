import { useState } from 'react'
import { useNavigate } from 'react-router'
import './dashboard.css'
import {
  AppShell,
  Badge,
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Radio,
  Skeleton,
  SummaryCard,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { LayersGlyph, OrdersGlyph, PlusGlyph } from '../../../components/ui/icons'
import { ORDER_STATUS, PAYMENT_STATUS, STOCK_STATUS, STORE_STATUS } from '../../../types/status'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import { DASHBOARD_METRICS, RECENT_ORDERS, STOCK_ALERTS } from './mock-data'
import type { RecentOrder } from './mock-data'

/** أعمدة جدول الطلبات الحديثة — «عرض الطلب» ينتقل لتفاصيله بالعنوان */
const orderColumns = (onView: (id: string) => void): ReadonlyArray<DataTableColumn<RecentOrder>> => [
  { key: 'id', header: 'رقم الطلب', numeric: true, cell: (row) => row.id },
  { key: 'customer', header: 'الزبون', cell: (row) => row.customer },
  { key: 'date', header: 'التاريخ', cell: (row) => row.date },
  { key: 'total', header: 'الإجمالي', numeric: true, cell: (row) => row.total },
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
  {
    key: 'actions',
    header: 'الإجراء',
    cell: (row) => (
      <Button variant="secondary" size="sm" aria-label={`عرض الطلب ${row.id}`} onClick={() => onView(row.id)}>
        عرض الطلب
      </Button>
    ),
  },
]

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type DashboardView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: DashboardView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'طلبات فارغة' },
  { value: 'error', label: 'خطأ' },
]

export function MerchantDashboardOverview() {
  const navigate = useNavigate()
  const [view, setView] = useState<DashboardView>('normal')
  const loading = view === 'loading'
  /* كل أرقام هذه الشاشة تخصّ المتجر النشط (D5) — يقابل GET /stores/{id}/dashboard */
  const store = useActiveStore()
  const seeded = store.hasSeedData
  /** مسار داخل صدفة المتجر النشط */
  const to = (sub: string) => `/merchant/${store.id}/${sub}`
  const orders = view === 'empty' || !seeded ? [] : RECENT_ORDERS
  const stockAlerts = seeded ? STOCK_ALERTS : []
  /* متجر بلا بيانات: أصفار حقيقية بدل نقل أرقام متجر آخر */
  const metrics = seeded
    ? DASHBOARD_METRICS
    : DASHBOARD_METRICS.map((metric) => ({ ...metric, value: '0', tone: 'neutral' as const, change: undefined }))

  return (
    <AppShell
      context="merchant"
      className="dash-shell"
      sidebar={<MerchantSidebar active="overview" />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title="نظرة عامة"
        description={`أهلاً فاطمة 👋 — هذا ملخص أداء «${store.name}» اليوم`}
        meta={<Badge variant={STORE_STATUS[store.status].variant}>{STORE_STATUS[store.status].label}</Badge>}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => navigate(to('products/new'))}>
            إضافة منتج
          </Button>
        }
        secondaryActions={
          <Button variant="secondary" onClick={() => navigate('/shop')}>
            معاينة المتجر
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة البيانات المعروضة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="dash-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {loading ? (
        <div className="dash-summary-grid">
          {metrics.map((metric) => (
            <Skeleton key={metric.key} variant="rect" height={104} />
          ))}
        </div>
      ) : (
        <div className="dash-summary-grid">
          {metrics.map((metric) => (
            <SummaryCard
              key={metric.key}
              label={metric.label}
              value={<span className="numeric">{metric.value}</span>}
              tone={metric.tone}
              change={metric.change}
            />
          ))}
        </div>
      )}

      <div className="dash-columns">
        <section className="dash-section" aria-labelledby="dash-orders-title">
          <div className="dash-section__head">
            <h2 id="dash-orders-title">طلبات حديثة</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(to('orders'))}>
              عرض كل الطلبات
            </Button>
          </div>
          <DataTable
            caption="أحدث الطلبات الواردة — بيانات تجريبية للعرض"
            columns={orderColumns((id) => navigate(to(`orders/${id}`)))}
            rows={orders}
            rowKey={(row) => row.id}
            loading={loading}
            error={view === 'error' ? 'تعذّر جلب الطلبات — تحقق من اتصالك ثم أعد المحاولة.' : undefined}
            onRetry={() => setView('normal')}
            emptyState={
              <EmptyState
                title="لا توجد طلبات حديثة"
                description="عندما يصل طلب جديد سيظهر هنا فوراً مع حالته وطريقة دفعه."
              />
            }
          />
        </section>

        <div className="dash-side">
          <section className="dash-section" aria-labelledby="dash-stock-title">
            <div className="dash-section__head">
              <h2 id="dash-stock-title">تنبيهات المخزون</h2>
              <Button variant="secondary" size="sm" onClick={() => navigate(to('inventory'))}>
                إدارة المخزون
              </Button>
            </div>
            <div className="dash-card">
              {loading ? (
                <div style={{ display: 'grid', gap: 'var(--space-md)', paddingBlock: 'var(--space-md)' }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="65%" />
                  <Skeleton variant="text" width="72%" />
                </div>
              ) : stockAlerts.length === 0 ? (
                <EmptyState title="لا تنبيهات مخزون" description="لا توجد منتجات منخفضة أو نافدة في هذا المتجر." />
              ) : (
                stockAlerts.map((item) => (
                  <div className="dash-stock-item" key={item.id}>
                    <div className="dash-stock-item__info">
                      <p className="dash-stock-item__name">{item.product}</p>
                      {item.variant && <p className="dash-stock-item__variant">{item.variant}</p>}
                    </div>
                    <div className="dash-stock-item__status">
                      <span className="dash-stock-item__remaining">
                        المتاح: <span className="numeric">{item.remaining}</span>
                      </span>
                      <Badge variant={STOCK_STATUS[item.status].variant}>{STOCK_STATUS[item.status].label}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="dash-section" aria-labelledby="dash-quick-title">
            <h2 id="dash-quick-title">إجراءات سريعة</h2>
            <div className="dash-card dash-quick">
              <Button variant="secondary" icon={<PlusGlyph />} onClick={() => navigate(to('products/new'))}>
                إضافة منتج
              </Button>
              <Button variant="secondary" icon={<OrdersGlyph />} onClick={() => navigate(to('orders'))}>
                مراجعة الطلبات
              </Button>
              <Button variant="secondary" icon={<LayersGlyph />} onClick={() => navigate(to('inventory'))}>
                تحديث المخزون
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
