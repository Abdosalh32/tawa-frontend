import { useState } from 'react'
import './dashboard.css'
import {
  AppShell,
  Badge,
  Button,
  DataTable,
  EmptyState,
  PageHeader,
  Radio,
  Sidebar,
  Skeleton,
  SummaryCard,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn, SidebarGroup } from '../../../components/ui'
import {
  GearGlyph,
  HomeGlyph,
  LayersGlyph,
  OrdersGlyph,
  PaletteGlyph,
  PercentGlyph,
  PlusGlyph,
  TagGlyph,
  UsersGlyph,
} from '../../../components/ui/icons'
import { ORDER_STATUS, PAYMENT_STATUS, STOCK_STATUS } from '../../../types/status'
import { DASHBOARD_METRICS, RECENT_ORDERS, STOCK_ALERTS } from './mock-data'
import type { RecentOrder } from './mock-data'

/**
 * بنود الملاحة بحسب البنية المعلوماتية الموثقة (information-architecture §1.1) —
 * «نظرة عامة» وحدها نشطة والبقية عرضية في هذه المرحلة.
 * لا جرس إشعارات (D7) ولا مبدّل متاجر (D5) ولا قسم عملاء (لا حسابات زبائن — A2).
 */
const NAV_GROUPS: SidebarGroup[] = [
  {
    title: 'التشغيل',
    items: [
      { key: 'overview', label: 'نظرة عامة', icon: <HomeGlyph />, active: true },
      { key: 'orders', label: 'الطلبات', icon: <OrdersGlyph />, count: 8 },
      { key: 'products', label: 'المنتجات', icon: <TagGlyph /> },
      { key: 'inventory', label: 'المخزون', icon: <LayersGlyph />, count: 3 },
      { key: 'discounts', label: 'الخصومات', icon: <PercentGlyph /> },
    ],
  },
  {
    title: 'المتجر',
    items: [
      { key: 'appearance', label: 'المظهر والقوالب', icon: <PaletteGlyph /> },
      { key: 'team', label: 'فريق العمل', icon: <UsersGlyph /> },
      { key: 'settings', label: 'إعدادات المتجر', icon: <GearGlyph /> },
    ],
  },
]

/** أعمدة جدول الطلبات الحديثة — أزرار «عرض» غير موصولة بأي خلفية */
const ORDER_COLUMNS: ReadonlyArray<DataTableColumn<RecentOrder>> = [
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
      <Button variant="secondary" size="sm" aria-label={`عرض الطلب ${row.id}`}>
        عرض الطلب
      </Button>
    ),
  },
]

function StoreBrand() {
  return (
    <div>
      <p className="dash-brand__name">متجر العافية</p>
      <p className="dash-brand__domain ltr">alafya.tawa.ly</p>
    </div>
  )
}

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type DashboardView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: DashboardView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'طلبات فارغة' },
  { value: 'error', label: 'خطأ' },
]

export function MerchantDashboardOverview() {
  const [view, setView] = useState<DashboardView>('normal')
  const loading = view === 'loading'
  const orders = view === 'empty' ? [] : RECENT_ORDERS

  return (
    <AppShell
      context="merchant"
      className="dash-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={NAV_GROUPS} />}
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
        title="نظرة عامة"
        description="أهلاً فاطمة 👋 — هذا ملخص أداء متجرك اليوم"
        meta={<Badge variant="success">المتجر منشور</Badge>}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />}>
            إضافة منتج
          </Button>
        }
        secondaryActions={<Button variant="secondary">معاينة المتجر</Button>}
      />

      <fieldset className="dash-dev">
        <legend>أداة معاينة تطويرية — حالة البيانات المعروضة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dash-dev__options">
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
          {DASHBOARD_METRICS.map((metric) => (
            <Skeleton key={metric.key} variant="rect" height={104} />
          ))}
        </div>
      ) : (
        <div className="dash-summary-grid">
          {DASHBOARD_METRICS.map((metric) => (
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
            <Button variant="ghost" size="sm">
              عرض كل الطلبات
            </Button>
          </div>
          <DataTable
            caption="أحدث الطلبات الواردة — بيانات تجريبية للعرض"
            columns={ORDER_COLUMNS}
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
              <Button variant="secondary" size="sm">
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
              ) : (
                STOCK_ALERTS.map((item) => (
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
              <Button variant="secondary" icon={<PlusGlyph />}>
                إضافة منتج
              </Button>
              <Button variant="secondary" icon={<OrdersGlyph />}>
                مراجعة الطلبات
              </Button>
              <Button variant="secondary" icon={<LayersGlyph />}>
                تحديث المخزون
              </Button>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
