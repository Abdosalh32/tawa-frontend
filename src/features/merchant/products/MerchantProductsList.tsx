import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import './products.css'
import {
  AppShell,
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  PageHeader,
  Pagination,
  Radio,
  SearchField,
  StatusText,
  Select,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { useTableSort } from '../../../components/ui'
import { PlusGlyph, TagGlyph } from '../../../components/ui/icons'
import { PRODUCT_STATUS, STOCK_STATUS } from '../../../types/status'
import type { ProductStatus } from '../../../types/status'
import { MerchantBreadcrumbs } from '../MerchantBreadcrumbs'
import { MerchantSidebar } from '../MerchantSidebar'
import { StoreSwitcher } from '../StoreSwitcher'
import { useActiveStore } from '../store-context'
import { MERCHANT_PRODUCTS } from './mock-data'
import type { MerchantProduct } from './mock-data'

/**
 * عتبة «مخزون منخفض» للتصفية المحلية في المعاينة فقط —
 * الحد الفعلي لكل منتج قرار معلّق (G4 في تحليل الفجوات).
 */
const LOW_STOCK_THRESHOLD = 5

const PAGE_SIZE = 5

/** مرجع ثابت لقائمة فارغة — يحفظ استقرار مراجع useMemo */
const NO_PRODUCTS: readonly MerchantProduct[] = []

type StatusFilter = 'all' | ProductStatus
type StockFilter = 'all' | 'available' | 'low' | 'out'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'no-products' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'no-products', label: 'لا منتجات إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

function stockCell(product: MerchantProduct) {
  if (product.available === 0) {
    return <Badge variant={STOCK_STATUS.out.variant}>{STOCK_STATUS.out.label}</Badge>
  }
  return (
    <span className="plist-stock">
      <span className="numeric">{product.available}</span>{' '}
      {product.available <= LOW_STOCK_THRESHOLD && (
        <Badge variant={STOCK_STATUS.low.variant}>{STOCK_STATUS.low.label}</Badge>
      )}
    </span>
  )
}

const COLUMNS: ReadonlyArray<DataTableColumn<MerchantProduct>> = [
  {
    key: 'product',
    header: 'المنتج',
    sortable: true,
    cell: (row) => (
      <span className="plist-product">
        {/* الصورة البديلة زخرفية — الاسم المجاور هو حامل المعنى */}
        <span className="plist-thumb" aria-hidden="true">
          <TagGlyph />
        </span>
        <span className="plist-name">{row.name}</span>
      </span>
    ),
  },
  { key: 'sku', header: 'رمز المنتج (SKU)', numeric: true, cell: (row) => row.sku },
  {
    key: 'variants',
    header: 'المتغيرات',
    cell: (row) =>
      row.variantCount > 0 ? (
        <span>
          <span className="numeric">{row.variantCount}</span> متغيرات
        </span>
      ) : (
        <span className="plist-muted">بلا متغيرات</span>
      ),
  },
  { key: 'available', header: 'المتاح للبيع', sortable: true, cell: stockCell },
  {
    key: 'status',
    header: 'الحالة',
    /* نقطة الحالة (توقيع ٥): كبسولة الصف محجوزة لتنبيه المخزون الفعلي */
    cell: (row) => <StatusText variant={PRODUCT_STATUS[row.status].variant}>{PRODUCT_STATUS[row.status].label}</StatusText>,
  },
  { key: 'updatedAt', header: 'آخر تحديث', cell: (row) => row.updatedAt },
]

/** عمود الإجراء يُبنى داخل المكوّن لأنه يحتاج التنقّل بالعنوان */
function actionsColumn(onEdit: (id: string) => void): DataTableColumn<MerchantProduct> {
  return {
    key: 'actions',
    header: 'الإجراء',
    cell: (row) => (
      <Button variant="quiet" size="sm" aria-label={`تعديل المنتج ${row.name}`} onClick={() => onEdit(row.id)}>
        تعديل
      </Button>
    ),
  }
}

export function MerchantProductsList() {
  const navigate = useNavigate()
  const { sort, onSortChange, sortRows } = useTableSort<MerchantProduct>({
    product: (row) => row.name,
    available: (row) => row.available,
  })
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [page, setPage] = useState(1)
  /* نطاق البيانات = المتجر النشط (D5) — يقابل GET /stores/{id}/products */
  const store = useActiveStore()
  const source = store.hasSeedData ? MERCHANT_PRODUCTS : NO_PRODUCTS

  const filtersActive = search.trim() !== '' || statusFilter !== 'all' || stockFilter !== 'all'

  /* التصفية محلية بالكامل على البيانات التجريبية — لا أي نداء شبكة */
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return source.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query) && !product.sku.toLowerCase().includes(query)) return false
      if (statusFilter !== 'all' && product.status !== statusFilter) return false
      if (stockFilter === 'available' && product.available === 0) return false
      if (stockFilter === 'low' && (product.available === 0 || product.available > LOW_STOCK_THRESHOLD)) return false
      if (stockFilter === 'out' && product.available !== 0) return false
      return true
    })
  }, [source, search, statusFilter, stockFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = sortRows(filtered).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /** «لا منتجات إطلاقاً» — إما بأداة المعاينة أو لأن المتجر النشط بلا منتجات */
  const noProducts = view === 'no-products' || source.length === 0
  const rows = noProducts ? [] : pageRows
  const loading = view === 'loading'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setStockFilter('all')
    setPage(1)
  }

  const emptyState =
    noProducts ? (
      /* فارغة-حقيقية: متجر بلا منتجات (برومت 4) */
      <EmptyState
        title="ابدأ بإضافة أول منتج"
        description="متجرك لا يحتوي منتجات بعد — أضف منتجك الأول ليظهر للزبائن فور النشر."
        action={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => navigate(`/merchant/${store.id}/products/new`)}>
            إضافة منتج
          </Button>
        }
      />
    ) : (
      /* فارغة-بفلتر: نتائج بحث/تصفية خالية */
      <EmptyState
        title="لا توجد منتجات مطابقة"
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
      className="plist-shell"
      sidebar={<MerchantSidebar active="products" />}
      topbar={
        <Topbar
          title="لوحة التاجر"
          storeContext={<StoreSwitcher />}
          userName="فاطمة"
        />
      }
    >
      <PageHeader
        title="المنتجات"
        description="أدر كتالوج متجرك: المنشور منه فقط يظهر للزبائن، والأرشفة تحفظ السجلات دون كسر الطلبات القديمة"
        meta={
          <Badge variant="neutral" dot={false}>
            <span className="numeric">{source.length}</span> منتجات
          </Badge>
        }
        breadcrumbs={<MerchantBreadcrumbs items={[{ label: 'الرئيسية', to: 'overview' }, { label: 'المنتجات' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => navigate(`/merchant/${store.id}/products/new`)}>
            إضافة منتج
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً؛ «لا نتائج» تظهر طبيعياً عند تصفية بلا مطابقات)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="plist-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      <FilterBar
        search={
          <SearchField
            label="بحث في المنتجات"
            placeholder="اسم المنتج أو رمز SKU…"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        }
        filters={
          <>
            <Select
              label="الحالة"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter)
                setPage(1)
              }}
            >
              <option value="all">الكل</option>
              {Object.entries(PRODUCT_STATUS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </Select>
            <Select
              label="التوفر"
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
            </Select>
          </>
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
        caption="قائمة منتجات المتجر — بيانات تجريبية للعرض"
        columns={[...COLUMNS, actionsColumn((id) => navigate(`/merchant/${store.id}/products/${id}/edit`))]}
        rows={rows}
        rowKey={(row) => row.id}
        sort={sort}
        onSortChange={onSortChange}
        loading={loading}
        error={view === 'error' ? 'تعذّر جلب المنتجات — تحقق من اتصالك ثم أعد المحاولة.' : undefined}
        onRetry={() => setView('normal')}
        emptyState={emptyState}
      />

      {view === 'normal' && filtered.length > 0 && (
        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      )}
    </AppShell>
  )
}
