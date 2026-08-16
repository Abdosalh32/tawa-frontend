import { useMemo, useState } from 'react'
import './discounts.css'
import {
  Alert,
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
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { PlusGlyph } from '../../../components/ui/icons'
import { DISCOUNT_STATUS } from '../../../types/status'
import type { DiscountStatus } from '../../../types/status'
import { StoreBrand } from '../StoreBrand'
import { buildMerchantNav } from '../merchant-nav'
import { MERCHANT_DISCOUNTS } from './mock-data'
import type { MerchantDiscount } from './mock-data'

const PAGE_SIZE = 5

type StatusFilter = 'all' | DiscountStatus

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا خصومات إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

function amount(value: number): string {
  return `${value} د.ل`
}

const COLUMNS: ReadonlyArray<DataTableColumn<MerchantDiscount>> = [
  { key: 'name', header: 'اسم الخصم', cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span> },
  { key: 'amount', header: 'القيمة (مبلغ ثابت)', numeric: true, cell: (row) => amount(row.amount) },
  { key: 'minOrder', header: 'الحد الأدنى للطلب', numeric: true, cell: (row) => amount(row.minOrder) },
  {
    key: 'period',
    header: 'فترة السريان',
    cell: (row) => (
      <span className="disc-period">
        {row.startsAt} — {row.endsAt}
      </span>
    ),
  },
  { key: 'usage', header: 'مرات الاستخدام', numeric: true, cell: (row) => String(row.usageCount) },
  {
    key: 'status',
    header: 'الحالة',
    cell: (row) => <Badge variant={DISCOUNT_STATUS[row.status].variant}>{DISCOUNT_STATUS[row.status].label}</Badge>,
  },
  {
    key: 'actions',
    header: 'الإجراء',
    cell: (row) => (
      <Button variant="secondary" size="sm" aria-label={`تعديل الخصم ${row.name}`}>
        تعديل
      </Button>
    ),
  },
]

export function MerchantDiscountsList() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const filtersActive = search.trim() !== '' || statusFilter !== 'all'

  /* تصفية محلية بالكامل — لا أي نداء شبكة */
  const filtered = useMemo(() => {
    const query = search.trim()
    return MERCHANT_DISCOUNTS.filter((discount) => {
      if (query && !discount.name.includes(query)) return false
      if (statusFilter !== 'all' && discount.status !== statusFilter) return false
      return true
    })
  }, [search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const rows = view === 'empty' ? [] : pageRows
  const loading = view === 'loading'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPage(1)
  }

  const emptyState =
    view === 'empty' ? (
      /* برومت 8: «لا توجد خصومات — أنشئ أول عرض لزيادة مبيعاتك» */
      <EmptyState
        title="لا توجد خصومات"
        description="أنشئ أول عرض لزيادة مبيعاتك — مبلغ ثابت بفترة سريان وحد أدنى للطلب."
        action={
          <Button variant="primary" icon={<PlusGlyph />}>
            إضافة خصم
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="لا توجد خصومات مطابقة"
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
      className="disc-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('discounts')} />}
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
        title="الخصومات"
        description="خصومات بمبلغ ثابت مع فترة سريان وحد أدنى لقيمة الطلب (1.5.1)"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'الخصومات' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />}>
            إضافة خصم
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً؛ «لا نتائج» تظهر عند تصفية بلا مطابقات)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="disc-view"
              label={option.label}
              value={option.value}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      <Alert variant="info" title="آلية تطبيق الخصم عند الزبون قرار معلّق (D9)">
        هل يُطبَّق الخصم تلقائياً عند بلوغ الحد الأدنى أم بوسيلة أخرى؟ لم تحسم المتطلبات ذلك — هذه الشاشة تعرض سجلات الخصومات
        فقط دون أي سلوك تطبيق.
      </Alert>

      <FilterBar
        search={
          <SearchField
            label="بحث في الخصومات"
            placeholder="اسم الخصم…"
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
          />
        }
        filters={
          <Select
            label="الحالة"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter)
              setPage(1)
            }}
          >
            <option value="all">الكل</option>
            {Object.entries(DISCOUNT_STATUS).map(([key, meta]) => (
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
        caption="خصومات المتجر — بيانات تجريبية للعرض"
        columns={COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        loading={loading}
        error={view === 'error' ? 'تعذّر جلب الخصومات — تحقق من اتصالك ثم أعد المحاولة.' : undefined}
        onRetry={() => setView('normal')}
        emptyState={emptyState}
      />

      {view === 'normal' && filtered.length > 0 && (
        <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
      )}
    </AppShell>
  )
}
