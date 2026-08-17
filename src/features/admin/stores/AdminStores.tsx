import { useEffect, useMemo, useState } from 'react'
import '../admin.css'
import './stores.css'
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
  KeyValueList,
  PageHeader,
  Radio,
  SearchField,
  Sidebar,
  Skeleton,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { STORE_STATUS } from '../../../types/status'
import type { StoreStatus } from '../../../types/status'
import { AdminBrand } from '../AdminBrand'
import { buildAdminNav } from '../admin-nav'
import { ADMIN_STORES } from './mock-data'
import type { AdminStore } from './mock-data'

type StatusFilter = 'all' | StoreStatus

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

interface LocalAction {
  status: StoreStatus
  suspension?: { reason: string; sinceDays: number }
}

export function AdminStores() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  /** إجراءات محلية فوق البيانات التجريبية — لا تعليق ولا حظر فعلياً */
  const [actions, setActions] = useState<Record<string, LocalAction>>({})
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [suspendId, setSuspendId] = useState<string | null>(null)
  const [banId, setBanId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const stores = useMemo(
    () =>
      ADMIN_STORES.map((store) => {
        const action = actions[store.id]
        if (!action) return store
        return { ...store, status: action.status, suspension: action.suspension }
      }),
    [actions],
  )

  const countOf = (status: StoreStatus) => stores.filter((store) => store.status === status).length

  const filtered = useMemo(() => {
    const query = search.trim()
    return stores.filter((store) => {
      if (statusFilter !== 'all' && store.status !== statusFilter) return false
      if (query && !store.storeName.includes(query) && !store.merchantName.includes(query) && !store.subdomain.includes(query.toLowerCase()))
        return false
      return true
    })
  }, [stores, search, statusFilter])

  const previewStore = stores.find((store) => store.id === previewId) ?? null
  const suspendStore = stores.find((store) => store.id === suspendId) ?? null
  const banStore = stores.find((store) => store.id === banId) ?? null

  const unsuspend = (store: AdminStore) => {
    setActions((prev) => ({ ...prev, [store.id]: { status: 'active' } }))
    setToast(`فُك تعليق «${store.storeName}» وأُعيد للعمل (معاينة محلية)`)
  }

  const columns: ReadonlyArray<DataTableColumn<AdminStore>> = [
    {
      key: 'store',
      header: 'المتجر',
      cell: (row) => (
        <span className="astr-store">
          {/* شعار مصغر Placeholder — الرفع الفعلي مؤجل */}
          <span className="astr-logo" aria-hidden="true">
            {row.storeName.trim().charAt(0)}
          </span>
          <span className="astr-store__name">{row.storeName}</span>
        </span>
      ),
    },
    { key: 'merchant', header: 'التاجر المالك', cell: (row) => row.merchantName },
    { key: 'subdomain', header: 'النطاق الفرعي', cell: (row) => <span className="ltr">{row.subdomain}</span> },
    { key: 'plan', header: 'الباقة', cell: (row) => row.planName },
    { key: 'products', header: 'عدد المنتجات', numeric: true, cell: (row) => String(row.productCount) },
    { key: 'registered', header: 'تاريخ التسجيل', cell: (row) => row.registeredAt },
    {
      key: 'status',
      header: 'الحالة',
      cell: (row) => <Badge variant={STORE_STATUS[row.status].variant}>{STORE_STATUS[row.status].label}</Badge>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (row) => (
        <span style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" aria-label={`معاينة متجر ${row.storeName}`} onClick={() => setPreviewId(row.id)}>
            معاينة
          </Button>
          {row.status === 'active' && (
            <Button variant="ghost" size="sm" aria-label={`تعليق متجر ${row.storeName}`} onClick={() => setSuspendId(row.id)}>
              تعليق
            </Button>
          )}
          {row.status === 'suspended' && (
            <Button variant="primary" size="sm" aria-label={`فك تعليق متجر ${row.storeName}`} onClick={() => unsuspend(row)}>
              فك التعليق
            </Button>
          )}
          {row.status !== 'banned' && (
            <Button variant="ghost" size="sm" aria-label={`حظر متجر ${row.storeName}`} onClick={() => setBanId(row.id)}>
              حظر
            </Button>
          )}
        </span>
      ),
    },
  ]

  const suspendedStores = filtered.filter((store) => store.status === 'suspended' && store.suspension)

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<Sidebar brand={<AdminBrand />} groups={buildAdminNav('stores')} />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title="المتاجر"
        description="تصفح متاجر المنصة بحالاتها ونطاقاتها، وعاين أي متجر للتحقق من جودة المحتوى ومشروعيته"
        meta={
          <Badge variant="neutral" dot={false}>
            <span className="numeric">{stores.length}</span> متجراً
          </Badge>
        }
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'المتاجر' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (إجراءات محلية على بيانات تجريبية، لا تعليق ولا حظر فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="astr-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {Object.keys(actions).length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setActions({})}>
              إعادة ضبط الإجراءات المحلية
            </Button>
          )}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <Skeleton variant="rect" height={40} />
          <Skeleton variant="rect" height={300} />
        </div>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState description="تعذّر جلب قائمة المتاجر — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <>
          <FilterBar
            search={<SearchField label="بحث في المتاجر" placeholder="اسم المتجر أو التاجر أو النطاق…" value={search} onChange={setSearch} />}
            filters={
              <div className="astr-chips" role="group" aria-label="تصفية بحالة المتجر">
                <button type="button" className="astr-chip" aria-pressed={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
                  الكل ({stores.length})
                </button>
                {(['active', 'suspended', 'banned'] as StoreStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="astr-chip"
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {STORE_STATUS[status].label} ({countOf(status)})
                  </button>
                ))}
              </div>
            }
            actions={
              (search.trim() !== '' || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('all')
                  }}
                >
                  مسح الفلاتر
                </Button>
              )
            }
          />

          {suspendedStores.map((store) => (
            <p className="astr-suspend-strip" key={store.id}>
              «{store.storeName}» معلّق منذ <span className="numeric">{store.suspension?.sinceDays}</span> أيام — السبب:{' '}
              {store.suspension?.reason}
              <Button variant="primary" size="sm" onClick={() => unsuspend(store)}>
                فك التعليق
              </Button>
            </p>
          ))}

          <DataTable
            caption="متاجر المنصة بحالاتها — بيانات تجريبية للعرض"
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                title="لا متاجر مطابقة"
                description="جرّب تعديل كلمات البحث أو امسح الفلاتر."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('all')
                    }}
                  >
                    مسح الفلاتر
                  </Button>
                }
              />
            }
          />
        </>
      )}

      <Drawer
        open={previewStore !== null}
        onClose={() => setPreviewId(null)}
        title={previewStore ? `معاينة متجر — ${previewStore.storeName}` : 'معاينة متجر'}
        footer={
          previewStore && (
            <>
              <Button variant="secondary">فتح المتجر في تبويب</Button>
              {previewStore.status === 'active' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSuspendId(previewStore.id)
                    setPreviewId(null)
                  }}
                >
                  تعليق المتجر
                </Button>
              )}
            </>
          )
        }
      >
        {previewStore && (
          <>
            <div className="astr-preview-frame" aria-hidden="true">
              <span className="astr-preview-frame__bar" />
              <span className="astr-preview-frame__hero" />
              <span className="astr-preview-frame__grid">
                <span className="astr-preview-frame__card" />
                <span className="astr-preview-frame__card" />
                <span className="astr-preview-frame__card" />
              </span>
            </div>
            <p className="admin-note">
              إطار تخطيطي مجرّد — معاينة واجهة المتجر الفعلية كما يراها الزبون (م.1.3.7) تفتح المتجر نفسه مع الربط
              الخلفي، ولا تُحاكى هنا.
            </p>
            <KeyValueList
              items={[
                { label: 'النطاق الفرعي', value: previewStore.subdomain, ltr: true },
                { label: 'التاجر المالك', value: previewStore.merchantName },
                { label: 'الحالة', value: <Badge variant={STORE_STATUS[previewStore.status].variant}>{STORE_STATUS[previewStore.status].label}</Badge> },
                { label: 'عدد المنتجات', value: String(previewStore.productCount), numeric: true },
                { label: 'آخر نشاط', value: previewStore.lastActivity },
                { label: 'مخالفات سابقة', value: String(previewStore.violations), numeric: true },
              ]}
            />
            {previewStore.suspension && (
              <Alert variant="warning" title="هذا المتجر معلّق حالياً">
                السبب المسجّل: {previewStore.suspension.reason} — منذ <span className="numeric">{previewStore.suspension.sinceDays}</span>{' '}
                أيام.
              </Alert>
            )}
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={suspendStore !== null}
        title={suspendStore ? `تعليق متجر ${suspendStore.storeName}` : 'تعليق المتجر'}
        impact={
          suspendStore
            ? `سيُجمَّد حساب (${suspendStore.merchantName}) ويُغلق متجره مؤقتاً حتى فك التعليق (م.1.3.4) — التجميد الفعلي مع الربط الخلفي (معاينة محلية).`
            : ''
        }
        confirmLabel="تعليق المتجر"
        requireReason
        reasonLabel="سبب التعليق (يُسجَّل في سجل التدقيق)"
        onConfirm={(reason) => {
          if (!suspendStore) return
          setActions((prev) => ({
            ...prev,
            [suspendStore.id]: { status: 'suspended', suspension: { reason: reason ?? '', sinceDays: 0 } },
          }))
          setToast(`عُلّق «${suspendStore.storeName}» مع تسجيل السبب (معاينة محلية)`)
          setSuspendId(null)
        }}
        onCancel={() => setSuspendId(null)}
      />

      <ConfirmDialog
        open={banStore !== null}
        title={banStore ? `حظر متجر ${banStore.storeName}` : 'حظر المتجر'}
        impact={
          banStore
            ? `سيُحظر المتجر ويُغلق نهائياً حتى قرار إداري بفك الحظر (م.1.3.4 – م.1.3.5) — التنفيذ الفعلي مع الربط الخلفي (معاينة محلية).`
            : ''
        }
        confirmLabel="حظر المتجر"
        requireReason
        reasonLabel="سبب الحظر (يُسجَّل في سجل التدقيق)"
        onConfirm={() => {
          if (!banStore) return
          setActions((prev) => ({ ...prev, [banStore.id]: { status: 'banned' } }))
          setToast(`حُظر «${banStore.storeName}» مع تسجيل السبب (معاينة محلية)`)
          setBanId(null)
        }}
        onCancel={() => setBanId(null)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
