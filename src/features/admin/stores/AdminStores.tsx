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
import { MERCHANT_STATUS, STORE_STATUS } from '../../../types/status'
import type { MerchantStatus, StoreStatus } from '../../../types/status'
import { AdminBrand } from '../AdminBrand'
import { buildAdminNav } from '../admin-nav'
import { ADMIN_STORES } from './mock-data'
import type { AdminStore } from './mock-data'

/** تصفية بحالة المتجر، أو بالتجار المعلّقين (merchants.status) */
type StatusFilter = 'all' | StoreStatus | 'suspended_merchant'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

interface LocalAction {
  /** التعليق يقع على حساب التاجر لا على المتجر (مواءمة الباكند) */
  merchantStatus: MerchantStatus
  status?: StoreStatus
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
        return {
          ...store,
          merchantStatus: action.merchantStatus,
          status: action.status ?? store.status,
          suspension: action.suspension,
        }
      }),
    [actions],
  )

  const countOf = (status: StoreStatus) => stores.filter((store) => store.status === status).length
  const suspendedMerchants = stores.filter((store) => store.merchantStatus === 'suspended').length

  const filtered = useMemo(() => {
    const query = search.trim()
    return stores.filter((store) => {
      if (statusFilter === 'suspended_merchant' && store.merchantStatus !== 'suspended') return false
      if (statusFilter !== 'all' && statusFilter !== 'suspended_merchant' && store.status !== statusFilter) return false
      if (query && !store.storeName.includes(query) && !store.merchantName.includes(query) && !store.subdomain.includes(query.toLowerCase()))
        return false
      return true
    })
  }, [stores, search, statusFilter])

  const previewStore = stores.find((store) => store.id === previewId) ?? null
  const suspendStore = stores.find((store) => store.id === suspendId) ?? null

  const unsuspend = (store: AdminStore) => {
    setActions((prev) => ({ ...prev, [store.id]: { merchantStatus: 'active' } }))
    setToast(`فُك تعليق حساب (${store.merchantName}) وأُعيد متجره للعمل (معاينة محلية)`)
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
      header: 'حالة المتجر',
      cell: (row) => <Badge variant={STORE_STATUS[row.status].variant}>{STORE_STATUS[row.status].label}</Badge>,
    },
    {
      key: 'merchantStatus',
      header: 'حساب التاجر',
      cell: (row) => (
        <Badge variant={MERCHANT_STATUS[row.merchantStatus].variant}>{MERCHANT_STATUS[row.merchantStatus].label}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      cell: (row) => (
        <span style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" aria-label={`معاينة متجر ${row.storeName}`} onClick={() => setPreviewId(row.id)}>
            معاينة
          </Button>
          {row.merchantStatus !== 'suspended' && (
            <Button variant="ghost" size="sm" aria-label={`تعليق حساب التاجر ${row.merchantName}`} onClick={() => setSuspendId(row.id)}>
              تعليق التاجر
            </Button>
          )}
          {row.merchantStatus === 'suspended' && (
            <Button variant="primary" size="sm" aria-label={`فك تعليق حساب ${row.merchantName}`} onClick={() => unsuspend(row)}>
              فك التعليق
            </Button>
          )}
        </span>
      ),
    },
  ]

  const suspendedStores = filtered.filter((store) => store.merchantStatus === 'suspended' && store.suspension)

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
                {(['active', 'draft', 'maintenance'] as StoreStatus[]).map((status) => (
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
                <button
                  type="button"
                  className="astr-chip"
                  aria-pressed={statusFilter === 'suspended_merchant'}
                  onClick={() => setStatusFilter('suspended_merchant')}
                >
                  تجار معلّقون ({suspendedMerchants})
                </button>
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
              حساب ({store.merchantName}) معلّق منذ <span className="numeric">{store.suspension?.sinceDays}</span> أيام — متجره
              «{store.storeName}» مغلق · السبب: {store.suspension?.reason}
              <Button variant="primary" size="sm" onClick={() => unsuspend(store)}>
                فك التعليق
              </Button>
            </p>
          ))}

          <Alert variant="info" title="مواءمة عقد الباكند">
            حالة المتجر ثلاثية (مسودة/منشور/صيانة) والتعليق يقع على <strong>حساب التاجر</strong> لا على المتجر.
            و«حظر المتجر» بلا مقابل في الباكند — يُضاف بعد قرار مالك المنتج.
          </Alert>

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
              {previewStore.merchantStatus !== 'suspended' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSuspendId(previewStore.id)
                    setPreviewId(null)
                  }}
                >
                  تعليق حساب التاجر
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
                { label: 'حالة المتجر', value: <Badge variant={STORE_STATUS[previewStore.status].variant}>{STORE_STATUS[previewStore.status].label}</Badge> },
                {
                  label: 'حساب التاجر',
                  value: (
                    <Badge variant={MERCHANT_STATUS[previewStore.merchantStatus].variant}>
                      {MERCHANT_STATUS[previewStore.merchantStatus].label}
                    </Badge>
                  ),
                },
                { label: 'عدد المنتجات', value: String(previewStore.productCount), numeric: true },
                { label: 'آخر نشاط', value: previewStore.lastActivity },
                { label: 'مخالفات سابقة', value: String(previewStore.violations), numeric: true },
              ]}
            />
            {previewStore.suspension && (
              <Alert variant="warning" title="حساب التاجر معلّق حالياً">
                السبب المسجّل: {previewStore.suspension.reason} — منذ <span className="numeric">{previewStore.suspension.sinceDays}</span>{' '}
                أيام.
              </Alert>
            )}
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={suspendStore !== null}
        title={suspendStore ? `تعليق حساب ${suspendStore.merchantName}` : 'تعليق حساب التاجر'}
        impact={
          suspendStore
            ? `سيُجمَّد حساب (${suspendStore.merchantName}) ويُغلق متجر «${suspendStore.storeName}» مؤقتاً حتى فك التعليق (م.1.3.4). التعليق يقع على حساب التاجر بحسب عقد الباكند — التنفيذ الفعلي مع الربط (معاينة محلية).`
            : ''
        }
        confirmLabel="تعليق حساب التاجر"
        requireReason
        reasonLabel="سبب التعليق (يُسجَّل في سجل التدقيق)"
        onConfirm={(reason) => {
          if (!suspendStore) return
          setActions((prev) => ({
            ...prev,
            [suspendStore.id]: {
              merchantStatus: 'suspended',
              status: 'maintenance',
              suspension: { reason: reason ?? '', sinceDays: 0 },
            },
          }))
          setToast(`عُلّق حساب (${suspendStore.merchantName}) وأُغلق متجره مع تسجيل السبب (معاينة محلية)`)
          setSuspendId(null)
        }}
        onCancel={() => setSuspendId(null)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
