import { useMemo, useState } from 'react'
import './orders.css'
import {
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  Radio,
  SearchField,
  Select,
  Sidebar,
  Tabs,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../types/status'
import type { OrderStatus, PaymentStatus } from '../../../types/status'
import { StoreBrand } from '../StoreBrand'
import { buildMerchantNav } from '../merchant-nav'
import { MERCHANT_ORDERS } from './mock-data'
import type { MerchantOrder } from './mock-data'

const PAGE_SIZE = 5

type StatusTab = 'all' | OrderStatus
type PaymentFilter = 'all' | PaymentStatus

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا طلبات إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

const COLUMNS: ReadonlyArray<DataTableColumn<MerchantOrder>> = [
  { key: 'id', header: 'رقم الطلب', numeric: true, cell: (row) => row.id },
  {
    key: 'customer',
    header: 'الزبون',
    cell: (row) => (
      <span className="olist-customer">
        <span className="olist-customer__name">{row.customer}</span>
        <span className="olist-customer__phone ltr">{row.phone}</span>
      </span>
    ),
  },
  { key: 'date', header: 'التاريخ', cell: (row) => row.date },
  { key: 'items', header: 'عدد العناصر', numeric: true, cell: (row) => String(row.itemCount) },
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

export function MerchantOrdersList() {
  const [view, setView] = useState<ScreenView>('normal')
  const [statusTab, setStatusTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [page, setPage] = useState(1)

  const filtersActive = search.trim() !== '' || paymentFilter !== 'all' || statusTab !== 'all'

  /** عدّادات التبويبات من القائمة التجريبية نفسها — لا أرقام مصطنعة */
  const tabItems = useMemo(() => {
    const countOf = (status: OrderStatus) => MERCHANT_ORDERS.filter((order) => order.status === status).length
    return [
      { key: 'all', label: 'الكل', count: MERCHANT_ORDERS.length },
      ...Object.entries(ORDER_STATUS).map(([key, meta]) => ({
        key,
        label: meta.label,
        count: countOf(key as OrderStatus),
      })),
    ]
  }, [])

  /* تصفية محلية بالكامل — لا أي نداء شبكة */
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return MERCHANT_ORDERS.filter((order) => {
      if (statusTab !== 'all' && order.status !== statusTab) return false
      if (paymentFilter !== 'all' && order.payment !== paymentFilter) return false
      if (query && !order.id.toLowerCase().includes(query) && !order.customer.includes(search.trim())) return false
      return true
    })
  }, [statusTab, paymentFilter, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const rows = view === 'empty' ? [] : pageRows
  const loading = view === 'loading'

  const resetFilters = () => {
    setSearch('')
    setPaymentFilter('all')
    setStatusTab('all')
    setPage(1)
  }

  const emptyState =
    view === 'empty' ? (
      <EmptyState
        title="لا طلبات بعد"
        description="عندما يصل أول طلب من زبائنك سيظهر هنا فوراً مع حالته وطريقة دفعه."
      />
    ) : (
      <EmptyState
        title="لا توجد طلبات مطابقة"
        description="جرّب تعديل كلمات البحث أو امسح الفلاتر."
        action={
          <Button variant="secondary" onClick={resetFilters}>
            مسح الفلاتر
          </Button>
        }
      />
    )

  return (
    <AppShell
      context="merchant"
      className="olist-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('orders')} />}
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
        title="الطلبات"
        description="تابع طلبات زبائنك وانقل حالاتها: مؤكد ← قيد التجهيز ← جاهز للتسليم ← مسلّم؛ الإلغاء يعيد الكميات للمخزون تلقائياً"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'الطلبات' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً؛ «لا نتائج» تظهر عند تصفية بلا مطابقات)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="olist-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      <Tabs
        label="تصفية بحالة الطلب"
        items={tabItems}
        value={statusTab}
        onChange={(key) => {
          setStatusTab(key as StatusTab)
          setPage(1)
        }}
      />

      <FilterBar
        search={
          <SearchField
            label="بحث في الطلبات"
            placeholder="رقم الطلب أو اسم الزبون…"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        }
        filters={
          <Select
            label="حالة الدفع"
            value={paymentFilter}
            onChange={(event) => {
              setPaymentFilter(event.target.value as PaymentFilter)
              setPage(1)
            }}
          >
            <option value="all">الكل</option>
            {Object.entries(PAYMENT_STATUS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </Select>
        }
        actions={
          filtersActive && (
            <Button variant="ghost" onClick={resetFilters}>
              مسح الفلاتر
            </Button>
          )
        }
      />

      <DataTable
        caption="طلبات المتجر الواردة — بيانات تجريبية للعرض"
        columns={COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        error={view === 'error' ? 'تعذّر جلب الطلبات — تحقق من اتصالك ثم أعد المحاولة.' : undefined}
        onRetry={() => setView('normal')}
        emptyState={emptyState}
      />

      {view === 'normal' && filtered.length > 0 && (
        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      )}
    </AppShell>
  )
}
