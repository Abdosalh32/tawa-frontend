import { useMemo, useState } from 'react'
import './inventory.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  IconButton,
  PageHeader,
  Pagination,
  Radio,
  SearchField,
  Select,
  Sidebar,
  SummaryCard,
  Tooltip,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { InfoGlyph } from '../../../components/ui/icons'
import { STOCK_STATUS } from '../../../types/status'
import { StoreBrand } from '../StoreBrand'
import { StoreSwitcher } from '../StoreSwitcher'
import { buildMerchantNav } from '../merchant-nav'
import { useActiveStore } from '../store-context'
import { INVENTORY_ROWS, availableOf, statusOf } from './mock-data'
import type { InventoryRow } from './mock-data'

const PAGE_SIZE = 6

/** مرجع ثابت لقائمة فارغة — يحفظ استقرار مراجع useMemo */
const NO_STOCK: readonly InventoryRow[] = []

type StockFilter = 'all' | 'available' | 'low' | 'out' | 'reserved'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا مخزون إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

const COLUMNS: ReadonlyArray<DataTableColumn<InventoryRow>> = [
  {
    key: 'product',
    header: 'المنتج',
    cell: (row) => (
      <span className="inv-product">
        <span className="inv-product__name">{row.product}</span>
        {row.variant && <span className="inv-product__variant">{row.variant}</span>}
      </span>
    ),
  },
  { key: 'sku', header: 'SKU', numeric: true, cell: (row) => row.sku },
  { key: 'total', header: 'الكلي', numeric: true, cell: (row) => String(row.total) },
  {
    key: 'reserved',
    header: (
      <span className="inv-header-hint">
        المحجوز
        <Tooltip label="محجوز 15 دقيقة لسلات شراء نشطة — يعود تلقائياً عند انتهاء المهلة">
          <IconButton label="ما معنى المحجوز؟" size="sm">
            <InfoGlyph />
          </IconButton>
        </Tooltip>
      </span>
    ),
    numeric: true,
    cell: (row) => String(row.reserved),
  },
  {
    key: 'available',
    header: 'المتاح للبيع',
    cell: (row) => <span className="numeric inv-available">{availableOf(row)}</span>,
  },
  { key: 'threshold', header: 'حد التنبيه', numeric: true, cell: (row) => String(row.threshold) },
  {
    key: 'status',
    header: 'الحالة',
    cell: (row) => {
      const status = statusOf(row)
      return <Badge variant={STOCK_STATUS[status].variant}>{STOCK_STATUS[status].label}</Badge>
    },
  },
  {
    key: 'actions',
    header: 'الإجراء',
    cell: (row) => (
      <Button variant="secondary" size="sm" aria-label={`تحديث كمية ${row.product}${row.variant ? ` — ${row.variant}` : ''}`}>
        تحديث الكمية
      </Button>
    ),
  },
]

export function MerchantInventoryList() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [page, setPage] = useState(1)
  /* نطاق البيانات = المتجر النشط (D5) — يقابل GET /stores/{id}/inventory */
  const store = useActiveStore()
  const source = store.hasSeedData ? INVENTORY_ROWS : NO_STOCK

  const filtersActive = search.trim() !== '' || stockFilter !== 'all'

  /* تصفية محلية بالكامل — لا أي نداء شبكة */
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return source.filter((row) => {
      if (query && !row.product.toLowerCase().includes(query) && !row.sku.toLowerCase().includes(query)) return false
      if (stockFilter === 'reserved') return row.reserved > 0
      if (stockFilter !== 'all' && statusOf(row) !== stockFilter) return false
      return true
    })
  }, [source, search, stockFilter])

  const lowCount = source.filter((row) => statusOf(row) === 'low').length
  const outCount = source.filter((row) => statusOf(row) === 'out').length
  const firstLow = source.find((row) => statusOf(row) === 'low')

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /** لا مخزون إطلاقاً — بأداة المعاينة أو لأن المتجر النشط بلا منتجات */
  const noStock = view === 'empty' || source.length === 0
  const rows = noStock ? [] : pageRows
  const loading = view === 'loading'

  const resetFilters = () => {
    setSearch('')
    setStockFilter('all')
    setPage(1)
  }

  const emptyState =
    noStock ? (
      <EmptyState
        title="لا مخزون بعد"
        description="أضف منتجات إلى متجرك ليظهر مخزونها هنا مع الكميات المحجوزة والمتاحة."
      />
    ) : (
      <EmptyState
        title="لا توجد عناصر مطابقة"
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
      className="inv-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('inventory')} />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title="المخزون"
        description="المتاح للبيع = الكمية الكلية − المحجوز مؤقتاً لسلات نشطة؛ التعديل اليدوي يعيد ضبط الكميات بعد الجرد"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'المخزون' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً؛ «لا نتائج» تظهر عند تصفية بلا مطابقات)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="inv-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {view === 'normal' && (
        <div className="inv-summary">
          <SummaryCard label="منتجات منخفضة المخزون" value={<span className="numeric">{lowCount}</span>} tone="warning" />
          <SummaryCard label="نفد المخزون" value={<span className="numeric">{outCount}</span>} tone="negative" />
        </div>
      )}

      {view === 'normal' && firstLow && (
        <Alert
          variant="warning"
          title={`مخزون منخفض: «${firstLow.product}» وصل لحد التنبيه`}
          action={
            <Button variant="secondary" size="sm" aria-label={`تحديث كمية ${firstLow.product}`}>
              تحديث الكمية
            </Button>
          }
        >
          المتاح للبيع: <span className="numeric">{availableOf(firstLow)}</span> — حد التنبيه:{' '}
          <span className="numeric">{firstLow.threshold}</span>
        </Alert>
      )}

      <FilterBar
        search={
          <SearchField
            label="بحث في المخزون"
            placeholder="اسم المنتج أو رمز SKU…"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        }
        filters={
          <Select
            label="حالة المخزون"
            value={stockFilter}
            onChange={(event) => {
              setStockFilter(event.target.value as StockFilter)
              setPage(1)
            }}
          >
            <option value="all">الكل</option>
            <option value="available">متوفر</option>
            <option value="low">مخزون منخفض</option>
            <option value="out">نفد المخزون</option>
            <option value="reserved">محجوز (سلات نشطة)</option>
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
        caption="مخزون المتجر بحسب المنتج والمتغير — بيانات تجريبية للعرض"
        columns={COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        error={view === 'error' ? 'تعذّر جلب بيانات المخزون — تحقق من اتصالك ثم أعد المحاولة.' : undefined}
        onRetry={() => setView('normal')}
        emptyState={emptyState}
        rowClassName={(row) => (statusOf(row) === 'out' ? 'inv-row-critical' : undefined)}
      />

      {view === 'normal' && filtered.length > 0 && (
        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      )}
    </AppShell>
  )
}
