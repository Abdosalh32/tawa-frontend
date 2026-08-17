import { useEffect, useMemo, useState } from 'react'
import './categories.css'
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
  Input,
  PageHeader,
  Radio,
  SearchField,
  Select,
  Sidebar,
  Skeleton,
  Switch,
  Textarea,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { FolderTreeGlyph, PlusGlyph } from '../../../components/ui/icons'
import { StoreBrand } from '../StoreBrand'
import { StoreSwitcher } from '../StoreSwitcher'
import { buildMerchantNav } from '../merchant-nav'
import { useActiveStore } from '../store-context'
import {
  EMPTY_DRAFT,
  MERCHANT_CATEGORIES,
  childCountOf,
  simulateServerSlug,
  treeOrder,
  validateCategoryDraft,
} from './categories-data'
import type { CategoryDraft, CategoryDraftErrors, MerchantCategory } from './categories-data'

/** مرجع ثابت لقائمة فارغة (متجر بلا تصنيفات) */
const NO_CATEGORIES: readonly MerchantCategory[] = []

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'empty' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا تصنيفات إطلاقاً' },
  { value: 'error', label: 'خطأ' },
]

/** وضع الدرج: إنشاء أو تعديل تصنيف بعينه (PUT موجود في العقد) */
type DrawerMode = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; id: string }

export function MerchantCategoriesList() {
  const [view, setView] = useState<ScreenView>('normal')
  /* التصنيفات تخصّ المتجر النشط (D5) — تقابل GET /stores/{id}/categories */
  const store = useActiveStore()
  const storeCategories = store.hasSeedData ? MERCHANT_CATEGORIES : NO_CATEGORIES
  const [categories, setCategories] = useState<readonly MerchantCategory[]>(storeCategories)
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState<DrawerMode>({ kind: 'closed' })
  const [draft, setDraft] = useState<CategoryDraft>(EMPTY_DRAFT)
  const [draftErrors, setDraftErrors] = useState<CategoryDraftErrors>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  /* تبديل المتجر يعيد تحميل تصنيفاته ويغلق أي درج مفتوح */
  useEffect(() => {
    setCategories(store.hasSeedData ? MERCHANT_CATEGORIES : NO_CATEGORIES)
    setDrawer({ kind: 'closed' })
    setSearch('')
  }, [store.id, store.hasSeedData])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  /* البحث المحلي يُبقي الأب ظاهراً إن طابق أحد فروعه (وإلا انقطعت الشجرة) */
  const rows = useMemo(() => {
    const ordered = treeOrder(categories)
    const query = search.trim()
    if (query === '') return ordered
    const matches = (category: MerchantCategory) => category.name.includes(query) || category.slug.includes(query.toLowerCase())
    return ordered.filter((category) => {
      if (matches(category)) return true
      if (category.parentId === null) {
        return categories.some((child) => child.parentId === category.id && matches(child))
      }
      const parent = categories.find((item) => item.id === category.parentId)
      return parent !== undefined && matches(parent)
    })
  }, [categories, search])

  const noCategories = view === 'empty' || categories.length === 0
  const shownRows = noCategories ? [] : rows
  const loading = view === 'loading'

  /** الآباء المتاحون في منتقي «التصنيف الأب» — الرئيسية فقط (شجرة بمستويين) */
  const rootOptions = categories.filter(
    (category) => category.parentId === null && !(drawer.kind === 'edit' && category.id === drawer.id),
  )

  const editingCategory = drawer.kind === 'edit' ? categories.find((category) => category.id === drawer.id) ?? null : null

  const openCreate = (parentId: string | null = null) => {
    setDraft({ ...EMPTY_DRAFT, parentId })
    setDraftErrors({})
    setDrawer({ kind: 'create' })
  }

  const openEdit = (category: MerchantCategory) => {
    setDraft({
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      isActive: category.isActive,
    })
    setDraftErrors({})
    setDrawer({ kind: 'edit', id: category.id })
  }

  const submitDrawer = () => {
    const errors = validateCategoryDraft(draft)
    setDraftErrors(errors)
    if (Object.keys(errors).length > 0) return

    const name = draft.name.trim()
    if (drawer.kind === 'create') {
      const created: MerchantCategory = {
        id: `cat-${categories.length + 1}-${name.length}`,
        name,
        slug: simulateServerSlug(name, categories),
        description: draft.description.trim(),
        parentId: draft.parentId,
        isActive: draft.isActive,
        createdAt: '17 أغسطس 2026',
      }
      setCategories((prev) => [...prev, created])
      setToast(`أُنشئ التصنيف «${name}» (معاينة محلية — لا حفظ فعلياً)`)
    } else if (drawer.kind === 'edit' && editingCategory) {
      setCategories((prev) =>
        prev.map((category) => {
          if (category.id !== editingCategory.id) return category
          return {
            ...category,
            name,
            /* الخادم يعيد توليد الـ slug فقط عند تغيّر الاسم */
            slug: name === editingCategory.name ? category.slug : simulateServerSlug(name, prev.filter((item) => item.id !== category.id)),
            description: draft.description.trim(),
            parentId: draft.parentId,
            isActive: draft.isActive,
          }
        }),
      )
      setToast(`حُدّث التصنيف «${name}» (معاينة محلية — لا حفظ فعلياً)`)
    }
    setDrawer({ kind: 'closed' })
  }

  const deleteTarget = categories.find((category) => category.id === deleteId) ?? null
  const deleteChildCount = deleteTarget ? childCountOf(categories, deleteTarget.id) : 0

  const confirmDelete = () => {
    if (!deleteTarget) return
    setCategories((prev) => prev.filter((category) => category.id !== deleteTarget.id))
    setDeleteId(null)
    setToast(`حُذف التصنيف «${deleteTarget.name}» (معاينة محلية)`)
  }

  const columns: ReadonlyArray<DataTableColumn<MerchantCategory>> = [
    {
      key: 'name',
      header: 'التصنيف',
      cell: (row) => (
        <span className={`clist-name${row.parentId !== null ? ' clist-name--child' : ''}`}>
          {row.parentId !== null && (
            <span className="clist-branch" aria-hidden="true">
              └
            </span>
          )}
          <span>
            <span className="clist-name__label">{row.name}</span>
            {row.parentId !== null && <span className="visually-hidden"> — تصنيف فرعي</span>}
            {row.description !== '' && <span className="clist-name__desc">{row.description}</span>}
          </span>
        </span>
      ),
    },
    {
      key: 'slug',
      header: 'المعرف (slug)',
      cell: (row) => <span className="ltr clist-slug">{row.slug}</span>,
    },
    {
      key: 'children',
      header: 'الفروع',
      cell: (row) => {
        if (row.parentId !== null) return <span className="clist-muted">فرعي</span>
        const count = childCountOf(categories, row.id)
        return count > 0 ? (
          <span>
            <span className="numeric">{count}</span> فروع
          </span>
        ) : (
          <span className="clist-muted">بلا فروع</span>
        )
      },
    },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) =>
        row.isActive ? <Badge variant="success">مفعّل</Badge> : <Badge variant="neutral">موقوف</Badge>,
    },
    { key: 'createdAt', header: 'أُنشئ في', cell: (row) => row.createdAt },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (row) => (
        <span className="clist-actions">
          <Button variant="secondary" size="sm" aria-label={`تعديل التصنيف ${row.name}`} onClick={() => openEdit(row)}>
            تعديل
          </Button>
          {row.parentId === null && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`إضافة تصنيف فرعي تحت ${row.name}`}
              onClick={() => openCreate(row.id)}
            >
              + فرعي
            </Button>
          )}
          <Button variant="ghost" size="sm" aria-label={`حذف التصنيف ${row.name}`} onClick={() => setDeleteId(row.id)}>
            حذف
          </Button>
        </span>
      ),
    },
  ]

  const drawerOpen = drawer.kind !== 'closed'
  const drawerTitle = drawer.kind === 'edit' ? `تعديل «${editingCategory?.name ?? ''}»` : 'تصنيف جديد'

  return (
    <AppShell
      context="merchant"
      className="clist-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('categories')} />}
      topbar={<Topbar title="لوحة التاجر" storeContext={<StoreSwitcher />} userName="فاطمة" />}
    >
      <PageHeader
        title="التصنيفات"
        description="نظّم منتجاتك في تصنيفات رئيسية وفرعية — يتصفح بها زبائنك متجرك ويصفّون نتائجهم"
        meta={
          <Badge variant="neutral" dot={false}>
            <span className="numeric">{categories.length}</span> تصنيفات
          </Badge>
        }
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'التصنيفات' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => openCreate()}>
            تصنيف جديد
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا سلوك فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="clist-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {categories.length !== storeCategories.length && (
            <Button variant="secondary" size="sm" onClick={() => setCategories(storeCategories)}>
              استعادة البيانات التجريبية
            </Button>
          )}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }} aria-hidden="true">
          <Skeleton variant="rect" height={44} />
          <Skeleton variant="rect" height={320} />
        </div>
      ) : view === 'error' ? (
        <div className="clist-card">
          <ErrorState
            description="تعذّر جلب التصنيفات — تحقق من اتصالك ثم أعد المحاولة."
            onRetry={() => setView('normal')}
          />
        </div>
      ) : (
        <>
          {!noCategories && (
            <div className="clist-toolbar">
              <SearchField
                label="بحث في التصنيفات"
                placeholder="اسم التصنيف أو معرفه…"
                value={search}
                onChange={setSearch}
              />
            </div>
          )}

          <DataTable
            caption="شجرة تصنيفات المتجر (رئيسي ← فرعي) — بيانات تجريبية للعرض"
            columns={columns}
            rows={shownRows}
            rowKey={(row) => row.id}
            loading={loading}
            rowClassName={(row) => (row.parentId !== null ? 'clist-row--child' : undefined)}
            emptyState={
              noCategories ? (
                <EmptyState
                  icon={<FolderTreeGlyph />}
                  title="لا تصنيفات بعد"
                  description="أنشئ أول تصنيف لينظم منتجاتك ويظهر شريط التصنيفات في متجرك."
                  action={
                    <Button variant="primary" icon={<PlusGlyph />} onClick={() => openCreate()}>
                      تصنيف جديد
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  title="لا توجد تصنيفات مطابقة"
                  description="جرّب تعديل كلمات البحث أو امسحها."
                  action={
                    <Button variant="secondary" onClick={() => setSearch('')}>
                      مسح البحث
                    </Button>
                  }
                />
              )
            }
          />
        </>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawer({ kind: 'closed' })}
        title={drawerTitle}
        footer={
          <>
            <Button variant="primary" onClick={submitDrawer}>
              {drawer.kind === 'edit' ? 'حفظ التعديلات' : 'إنشاء التصنيف'}
            </Button>
            <Button variant="secondary" onClick={() => setDrawer({ kind: 'closed' })}>
              إلغاء
            </Button>
          </>
        }
      >
        <div className="clist-form">
          <Input
            label="اسم التصنيف"
            value={draft.name}
            maxLength={255}
            error={draftErrors.name}
            helperText="يظهر لزبائنك في شريط تصنيفات المتجر وفلاتره"
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Textarea
            label="الوصف"
            optional
            value={draft.description}
            maxLength={1000}
            error={draftErrors.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          />
          <Select
            label="التصنيف الأب"
            optional
            helperText="شجرة بمستويين: التصنيف الفرعي يتبع رئيسياً ولا يكون أباً بدوره"
            value={draft.parentId ?? ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, parentId: event.target.value === '' ? null : event.target.value }))}
          >
            <option value="">بلا أب — تصنيف رئيسي</option>
            {rootOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          {drawer.kind === 'edit' && editingCategory !== null && childCountOf(categories, editingCategory.id) > 0 && (
            <Alert variant="info" title="لهذا التصنيف فروع">
              نقله تحت أب سيجعل فروعه أعمق من مستويين — أعد ربط فروعه أولاً إن أردت نقله.
            </Alert>
          )}
          <Switch
            label={draft.isActive ? 'مفعّل — يظهر لزبائنك' : 'موقوف — مخفي عن زبائنك'}
            checked={draft.isActive}
            onChange={(next) => setDraft((prev) => ({ ...prev, isActive: next }))}
          />
          {drawer.kind === 'edit' && editingCategory !== null && (
            <p className="clist-slug-note">
              المعرف الحالي: <span className="ltr clist-slug">{editingCategory.slug}</span> — يولّده الخادم من الاسم
              ويتغيّر آلياً عند تغييره.
            </p>
          )}
          {drawer.kind === 'create' && (
            <p className="clist-slug-note">المعرف (slug) يولّده الخادم آلياً من الاسم — لا يُدخل يدوياً.</p>
          )}
        </div>
      </Drawer>

      {deleteTarget && (
        <ConfirmDialog
          open
          title={`حذف التصنيف «${deleteTarget.name}»؟`}
          impact={
            deleteChildCount > 0
              ? `سيختفي التصنيف من متجرك، وتبقى فروعه (${deleteChildCount}) دون حذف — مرتبطة بأب محذوف حتى تعيد ربطها.`
              : 'سيختفي التصنيف من شريط تصنيفات متجرك وفلاتره — منتجاته لا تُحذف.'
          }
          confirmLabel="حذف التصنيف"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
