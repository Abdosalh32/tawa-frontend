import { useEffect, useMemo, useState } from 'react'
import './discounts.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  EmptyState,
  ErrorState,
  FilterBar,
  Input,
  PageHeader,
  Pagination,
  Radio,
  SearchField,
  Select,
  Sidebar,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { PlusGlyph } from '../../../components/ui/icons'
import { DISCOUNT_STATUS } from '../../../types/status'
import { describeDiscountValue } from '../../../types/discount'
import type { DiscountType } from '../../../types/discount'
import { StoreBrand } from '../StoreBrand'
import { buildMerchantNav } from '../merchant-nav'
import { MERCHANT_DISCOUNTS, discountState } from './mock-data'
import type { MerchantDiscount } from './mock-data'

const PAGE_SIZE = 5

type StatusFilter = 'all' | 'active' | 'ended'
type TypeFilter = 'all' | DiscountType

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا خصومات إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

interface NewDiscount {
  title: string
  code: string
  type: DiscountType
  value: string
  minOrderAmount: string
  maxDiscountAmount: string
  usageLimit: string
  startsAt: string
  endsAt: string
}

function emptyDraft(): NewDiscount {
  return { title: '', code: '', type: 'fixed', value: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', startsAt: '', endsAt: '' }
}

/** يطابق قواعد DiscountRequest: code و type و value إلزامية */
function validateDraft(draft: NewDiscount, existing: readonly MerchantDiscount[]) {
  const errors: Partial<Record<'title' | 'code' | 'value', string>> = {}
  if (draft.title.trim() === '') errors.title = 'اسم الخصم مطلوب للعرض في لوحتك'
  const code = draft.code.trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,50}$/.test(code)) {
    errors.code = 'الكود: أحرف لاتينية وأرقام وشرطات (3–50) — يكتبه الزبون في السلة'
  } else if (existing.some((item) => item.code.toUpperCase() === code)) {
    errors.code = 'هذا الكود مستخدم في متجرك — الكود فريد لكل متجر'
  }
  const value = Number(draft.value)
  if (draft.value.trim() === '' || !Number.isFinite(value) || value <= 0) {
    errors.value = 'أدخل قيمة رقمية أكبر من صفر'
  } else if (draft.type === 'percentage' && value > 100) {
    errors.value = 'النسبة المئوية لا تتجاوز 100'
  }
  return errors
}

export function MerchantDiscountsList() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)
  /** إضافة وحذف محليان — لا حفظ فعلياً */
  const [discounts, setDiscounts] = useState<readonly MerchantDiscount[]>(MERCHANT_DISCOUNTS)
  const [createOpen, setCreateOpen] = useState(false)
  const [draft, setDraft] = useState<NewDiscount>(emptyDraft)
  const [draftErrors, setDraftErrors] = useState<ReturnType<typeof validateDraft>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const filtersActive = search.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'
  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPage(1)
  }

  /* تصفية محلية بالكامل — لا أي نداء شبكة */
  const filtered = useMemo(() => {
    const query = search.trim()
    return discounts.filter((discount) => {
      if (query && !discount.title.includes(query) && !discount.code.toUpperCase().includes(query.toUpperCase())) return false
      if (statusFilter !== 'all' && discountState(discount) !== statusFilter) return false
      if (typeFilter !== 'all' && discount.type !== typeFilter) return false
      return true
    })
  }, [discounts, search, statusFilter, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rows = view === 'empty' ? [] : pageRows
  const deleteTarget = discounts.find((discount) => discount.id === deleteId) ?? null

  const createDiscount = () => {
    const errors = validateDraft(draft, discounts)
    setDraftErrors(errors)
    if (Object.keys(errors).length > 0) return
    const code = draft.code.trim().toUpperCase()
    setDiscounts((prev) => [
      {
        id: `d-local-${prev.length + 1}`,
        title: draft.title.trim(),
        code,
        type: draft.type,
        value: Number(draft.value),
        minOrderAmount: draft.minOrderAmount.trim() === '' ? 0 : Number(draft.minOrderAmount),
        maxDiscountAmount:
          draft.type === 'percentage' && draft.maxDiscountAmount.trim() !== '' ? Number(draft.maxDiscountAmount) : undefined,
        usageLimit: draft.usageLimit.trim() === '' ? undefined : Number(draft.usageLimit),
        usedCount: 0,
        isActive: true,
        startsAt: draft.startsAt || undefined,
        endsAt: draft.endsAt || undefined,
      },
      ...prev,
    ])
    setToast(`أُنشئ الخصم «${code}» (معاينة محلية — لا حفظ فعلياً)`)
    setCreateOpen(false)
    setDraft(emptyDraft())
    setDraftErrors({})
  }

  const columns: ReadonlyArray<DataTableColumn<MerchantDiscount>> = [
    { key: 'title', header: 'اسم الخصم', cell: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span> },
    { key: 'code', header: 'الكود', numeric: true, cell: (row) => row.code },
    {
      key: 'type',
      header: 'النوع',
      cell: (row) => (
        <Badge variant={row.type === 'percentage' ? 'info' : 'neutral'} dot={false}>
          {row.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
        </Badge>
      ),
    },
    { key: 'value', header: 'القيمة', cell: (row) => <span className="numeric">{describeDiscountValue(row)}</span> },
    { key: 'min', header: 'الحد الأدنى للطلب', numeric: true, cell: (row) => `${row.minOrderAmount} د.ل` },
    {
      key: 'usage',
      header: 'الاستخدام',
      cell: (row) => (
        <span className="numeric">
          {row.usedCount}
          {row.usageLimit !== undefined ? ` / ${row.usageLimit}` : ''}
        </span>
      ),
    },
    {
      key: 'period',
      header: 'فترة السريان',
      cell: (row) => (
        <span className="disc-period">
          {row.startsAt ?? '—'} — {row.endsAt ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) => {
        const state = discountState(row)
        return <Badge variant={DISCOUNT_STATUS[state].variant}>{DISCOUNT_STATUS[state].label}</Badge>
      },
    },
    {
      key: 'actions',
      header: 'الإجراء',
      cell: (row) => (
        <Button variant="ghost" size="sm" aria-label={`حذف الخصم ${row.code}`} onClick={() => setDeleteId(row.id)}>
          حذف
        </Button>
      ),
    },
  ]

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
        description="أكواد خصم يكتبها الزبون في سلته — مبلغ ثابت أو نسبة مئوية بسقف، مع حد أدنى للطلب وفترة سريان وحد استخدامات"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'الخصومات' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => setCreateOpen(true)}>
            خصم جديد
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (إضافة وحذف محليان، لا حفظ فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="disc-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {discounts.length !== MERCHANT_DISCOUNTS.length && (
            <Button variant="secondary" size="sm" onClick={() => setDiscounts(MERCHANT_DISCOUNTS)}>
              إعادة ضبط الخصومات التجريبية
            </Button>
          )}
        </div>
      </fieldset>

      <Alert variant="info" title="مواءمة عقد الباكند">
        الخصم يُطبَّق <strong>بكود يكتبه الزبون</strong> ويتحقق منه المتجر، ويقبل نوعين: مبلغ ثابت أو نسبة مئوية بسقف
        أعلى. <strong>لا مسار تعديل</strong> للخصم في الباكند — المتاح إنشاء وحذف وتحقق، فلا نعرض زر تعديل.
      </Alert>

      {view === 'loading' ? (
        <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <div className="tw-skeleton tw-skeleton--rect" style={{ height: 44 }} />
          <div className="tw-skeleton tw-skeleton--rect" style={{ height: 260 }} />
        </div>
      ) : view === 'error' ? (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
          <ErrorState description="تعذّر جلب الخصومات — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <>
          <FilterBar
            search={
              <SearchField
                label="بحث في الخصومات"
                placeholder="اسم الخصم أو الكود…"
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
                  {Object.entries(DISCOUNT_STATUS).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="النوع"
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(event.target.value as TypeFilter)
                    setPage(1)
                  }}
                >
                  <option value="all">الكل</option>
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="percentage">نسبة مئوية</option>
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
            caption="أكواد خصم المتجر — بيانات تجريبية للعرض"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyState={
              view === 'empty' ? (
                <EmptyState
                  title="لا توجد خصومات"
                  description="أنشئ أول كود خصم لزيادة مبيعاتك — مبلغ ثابت أو نسبة مئوية."
                  action={
                    <Button variant="primary" icon={<PlusGlyph />} onClick={() => setCreateOpen(true)}>
                      خصم جديد
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
            }
          />

          {view === 'normal' && filtered.length > 0 && <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />}
        </>
      )}

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="خصم جديد"
        footer={
          <>
            <Button variant="primary" onClick={createDiscount}>
              إنشاء الخصم
            </Button>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
          </>
        }
      >
        <Input
          label="اسم الخصم"
          helperText="للعرض في لوحتك فقط"
          value={draft.title}
          error={draftErrors.title}
          onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
        />
        <Input
          label="كود الخصم"
          ltr
          helperText="يكتبه الزبون في سلته — فريد داخل متجرك"
          value={draft.code}
          error={draftErrors.code}
          onChange={(event) => setDraft((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
        />
        <Select
          label="نوع الخصم"
          value={draft.type}
          onChange={(event) => setDraft((prev) => ({ ...prev, type: event.target.value as DiscountType }))}
        >
          <option value="fixed">مبلغ ثابت (د.ل)</option>
          <option value="percentage">نسبة مئوية (%)</option>
        </Select>
        <Input
          label={draft.type === 'fixed' ? 'قيمة الخصم (د.ل)' : 'نسبة الخصم (%)'}
          type="number"
          min={0}
          value={draft.value}
          error={draftErrors.value}
          onChange={(event) => setDraft((prev) => ({ ...prev, value: event.target.value }))}
        />
        {draft.type === 'percentage' && (
          <Input
            label="الحد الأعلى للخصم (د.ل)"
            type="number"
            min={0}
            optional
            helperText="سقف يمنع تجاوز الخصم مبلغاً معيناً"
            value={draft.maxDiscountAmount}
            onChange={(event) => setDraft((prev) => ({ ...prev, maxDiscountAmount: event.target.value }))}
          />
        )}
        <Input
          label="الحد الأدنى لقيمة الطلب (د.ل)"
          type="number"
          min={0}
          optional
          value={draft.minOrderAmount}
          onChange={(event) => setDraft((prev) => ({ ...prev, minOrderAmount: event.target.value }))}
        />
        <Input
          label="حد عدد الاستخدامات"
          type="number"
          min={1}
          optional
          helperText="اتركه فارغاً لاستخدام غير محدود"
          value={draft.usageLimit}
          onChange={(event) => setDraft((prev) => ({ ...prev, usageLimit: event.target.value }))}
        />
        <Input
          label="يبدأ في"
          type="date"
          optional
          value={draft.startsAt}
          onChange={(event) => setDraft((prev) => ({ ...prev, startsAt: event.target.value }))}
        />
        <Input
          label="ينتهي في"
          type="date"
          optional
          value={draft.endsAt}
          onChange={(event) => setDraft((prev) => ({ ...prev, endsAt: event.target.value }))}
        />
      </Drawer>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget ? `حذف الخصم ${deleteTarget.code}` : 'حذف الخصم'}
        impact={
          deleteTarget
            ? `سيتوقف قبول الكود «${deleteTarget.code}» فوراً في سلات الزبائن. الطلبات التي استخدمته سابقاً لا تتغير — الحذف الفعلي مع الربط الخلفي (معاينة محلية).`
            : ''
        }
        confirmLabel="حذف الخصم"
        onConfirm={() => {
          if (!deleteTarget) return
          setDiscounts((prev) => prev.filter((item) => item.id !== deleteTarget.id))
          setToast(`حُذف الخصم «${deleteTarget.code}» (معاينة محلية)`)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
