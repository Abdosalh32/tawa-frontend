import { useEffect, useMemo, useState } from 'react'
import '../admin.css'
import './moderation.css'
import {
  Alert,
  AppShell,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  FilterBar,
  Modal,
  PageHeader,
  Radio,
  SearchField,
  Select,
  Skeleton,
  Textarea,
  Toast,
  Topbar,
} from '../../../components/ui'
import { TagGlyph } from '../../../components/ui/icons'
import { MODERATION_STATUS } from '../../../types/status'
import type { ModerationStatus } from '../../../types/status'
import { AdminBreadcrumbs } from '../AdminBreadcrumbs'
import { AdminSidebar } from '../AdminSidebar'
import { MODERATION_PRODUCTS, VIOLATION_REASONS, repeatOffenders } from './mock-data'
import type { ModerationProduct } from './mock-data'

type StatusFilter = 'all' | ModerationStatus

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

export function AdminModeration() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  /** قرارات الفحص المحلية — لا حظر ولا إزالة فعلياً */
  const [decisions, setDecisions] = useState<Record<string, { status: ModerationStatus; reason?: string; evidence?: string }>>({})
  const [banTarget, setBanTarget] = useState<ModerationProduct | null>(null)
  const [banReason, setBanReason] = useState(VIOLATION_REASONS[0])
  const [banEvidence, setBanEvidence] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const products = useMemo(
    () =>
      MODERATION_PRODUCTS.map((product) => {
        const decision = decisions[product.id]
        if (!decision) return product
        return decision.status === 'violating'
          ? { ...product, status: 'violating' as const, violation: { reason: decision.reason ?? '', evidence: decision.evidence ?? '' } }
          : { ...product, status: decision.status, violation: undefined }
      }),
    [decisions],
  )

  const storeNames = useMemo(() => [...new Set(MODERATION_PRODUCTS.map((product) => product.storeName))], [])
  const pendingCount = products.filter((product) => product.status === 'pending').length
  const offenders = useMemo(() => repeatOffenders(products), [products])

  const filtered = useMemo(() => {
    const query = search.trim()
    return products.filter((product) => {
      if (statusFilter !== 'all' && product.status !== statusFilter) return false
      if (storeFilter !== 'all' && product.storeName !== storeFilter) return false
      if (query && !product.name.includes(query) && !product.storeName.includes(query)) return false
      return true
    })
  }, [products, search, storeFilter, statusFilter])

  const markOk = (product: ModerationProduct) => {
    setDecisions((prev) => ({ ...prev, [product.id]: { status: 'ok' } }))
    setToast(`وُسم «${product.name}» سليماً (معاينة محلية)`)
  }

  const openBan = (product: ModerationProduct) => {
    setBanTarget(product)
    setBanReason(VIOLATION_REASONS[0])
    setBanEvidence('')
  }

  const confirmBan = () => {
    if (!banTarget || banEvidence.trim() === '') return
    setDecisions((prev) => ({
      ...prev,
      [banTarget.id]: { status: 'violating', reason: banReason, evidence: banEvidence.trim() },
    }))
    setToast(`حُظر «${banTarget.name}» وأُشعر التاجر بالدليل (معاينة محلية — لا إزالة فعلية)`)
    setBanTarget(null)
  }

  const filtersActive = search.trim() !== '' || storeFilter !== 'all' || statusFilter !== 'all'
  const resetFilters = () => {
    setSearch('')
    setStoreFilter('all')
    setStatusFilter('all')
  }

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<AdminSidebar active="moderation" />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title="فحص المنتجات"
        description="رقابة على منتجات كل المتاجر لضمان خلو المنصة من المنتجات المحظورة؛ حظر المنتج يزيله فوراً ويُشعر التاجر بالدليل"
        meta={<Badge variant="warning">{pendingCount} بانتظار الفحص</Badge>}
        breadcrumbs={<AdminBreadcrumbs items={[{ label: 'الرئيسية', to: '/admin' }, { label: 'فحص المنتجات' }]} />}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (قرارات محلية على بيانات تجريبية، لا حظر ولا إزالة فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="amod-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {Object.keys(decisions).length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setDecisions({})}>
              إعادة ضبط القرارات المحلية
            </Button>
          )}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div className="amod-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} variant="rect" height={260} />
          ))}
        </div>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState description="تعذّر جلب منتجات الفحص — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <>
          <FilterBar
            search={<SearchField label="بحث شامل في المنتجات" placeholder="اسم المنتج أو المتجر…" value={search} onChange={setSearch} />}
            filters={
              <>
                <Select label="المتجر" value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
                  <option value="all">كل المتاجر</option>
                  {storeNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
                <Select label="حالة الفحص" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
                  <option value="all">الكل</option>
                  {Object.entries(MODERATION_STATUS).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
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

          <div className="admin-columns">
            <div style={{ minWidth: 0 }}>
              {filtered.length === 0 ? (
                <div className="admin-card">
                  <EmptyState
                    title="لا منتجات مطابقة"
                    description="جرّب تعديل كلمات البحث أو امسح الفلاتر."
                    action={
                      <Button variant="secondary" onClick={resetFilters}>
                        مسح الفلاتر
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="amod-grid">
                  {filtered.map((product) => (
                    <article className={`amod-card${product.status === 'violating' ? ' amod-card--violating' : ''}`} key={product.id}>
                      {/* الصورة زخرفية — اسم المنتج المجاور حامل المعنى */}
                      <span className="amod-card__img" aria-hidden="true">
                        <TagGlyph />
                      </span>
                      <p className="amod-card__name">{product.name}</p>
                      <button type="button" className="amod-card__store">
                        {product.storeName}
                      </button>
                      <p className="amod-card__price">
                        <span className="numeric">{product.price} د.ل</span>
                      </p>
                      <Badge variant={MODERATION_STATUS[product.status].variant}>{MODERATION_STATUS[product.status].label}</Badge>
                      <div className="amod-card__actions">
                        {product.status !== 'ok' && (
                          <Button variant="secondary" size="sm" aria-label={`وسم ${product.name} سليماً`} onClick={() => markOk(product)}>
                            سليم
                          </Button>
                        )}
                        {product.status !== 'violating' && (
                          <Button variant="ghost" size="sm" aria-label={`حظر وإزالة ${product.name}`} onClick={() => openBan(product)}>
                            مخالف
                          </Button>
                        )}
                      </div>
                      {product.violation && (
                        <p className="admin-note">
                          السبب: {product.violation.reason} — الدليل المرسل: {product.violation.evidence}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <section className="admin-card" aria-labelledby="amod-offenders">
              <h2 id="amod-offenders">متاجر متكررة المخالفات</h2>
              {offenders.length === 0 ? (
                <p className="admin-note">لا مخالفات مسجّلة حالياً.</p>
              ) : (
                <div>
                  {offenders.map((offender) => (
                    <div className="amod-offender" key={offender.storeName}>
                      <span className="amod-offender__info">
                        <span style={{ fontWeight: 600 }}>{offender.storeName}</span>
                        <span className="amod-offender__count">
                          <span className="numeric">{offender.count}</span> مخالفة مسجّلة
                        </span>
                      </span>
                      <Button variant="secondary" size="sm" aria-label={`مراجعة متجر ${offender.storeName}`}>
                        مراجعة المتجر
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Alert variant="info" title="تكرار المخالفة يستدعي قراراً">
                تعليق المتجر بالكامل يُتخذ من شاشة «المتاجر» (م.1.3.4) بعد تكرار المخالفات.
              </Alert>
            </section>
          </div>
        </>
      )}

      <Modal
        open={banTarget !== null}
        onClose={() => setBanTarget(null)}
        title={banTarget ? `حظر وإزالة: ${banTarget.name}` : 'حظر منتج'}
        dismissOnBackdrop={false}
        footer={
          <>
            <Button variant="danger" disabled={banEvidence.trim() === ''} onClick={confirmBan}>
              حظر وإزالة
            </Button>
            <Button variant="secondary" onClick={() => setBanTarget(null)}>
              تراجع
            </Button>
          </>
        }
      >
        {banTarget && (
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            <p>
              المنتج «{banTarget.name}» في متجر «{banTarget.storeName}»
            </p>
            <Select label="سبب المخالفة" value={banReason} onChange={(event) => setBanReason(event.target.value)}>
              {VIOLATION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Select>
            <Textarea
              label="الدليل / التفاصيل"
              helperText="يُرسل للتاجر مع إشعار الإزالة (م.1.3.9)"
              rows={3}
              value={banEvidence}
              onChange={(event) => setBanEvidence(event.target.value)}
            />
            <Alert variant="warning" title="سيُزال المنتج فوراً ويُشعر التاجر بالبريد مع الدليل">
              تُسجَّل العملية في سجل التدقيق (م.1.3.13) — التنفيذ الفعلي مع الربط الخلفي (معاينة محلية).
            </Alert>
          </div>
        )}
      </Modal>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
