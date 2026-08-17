import { useEffect, useMemo, useState } from 'react'
import '../admin.css'
import './plans.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  DataTable,
  Drawer,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  Radio,
  Select,
  Sidebar,
  Skeleton,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { PlusGlyph } from '../../../components/ui/icons'
import { AdminBrand } from '../AdminBrand'
import { buildAdminNav } from '../admin-nav'
import { MANUAL_RENEWALS, RENEWAL_MERCHANTS, SUBSCRIPTION_PLANS } from './mock-data'
import type { ManualRenewal, SubscriptionPlan } from './mock-data'

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

interface PlanEdits {
  name: string
  monthlyPrice: string
  productLimit: string
  employeeLimit: string
}

const RENEWAL_COLUMNS: ReadonlyArray<DataTableColumn<ManualRenewal>> = [
  { key: 'merchant', header: 'التاجر', cell: (row) => row.merchantName },
  { key: 'plan', header: 'الباقة', cell: (row) => row.planName },
  { key: 'paid', header: 'تاريخ السداد', cell: (row) => row.paidAt },
  { key: 'duration', header: 'المدة', cell: (row) => row.duration },
  { key: 'by', header: 'نفّذها', cell: (row) => row.executedBy },
]

export function AdminPlans() {
  const [view, setView] = useState<ScreenView>('normal')
  /** تعديلات وأرشفة محلية فوق البيانات التجريبية — لا حفظ فعلياً */
  const [overrides, setOverrides] = useState<Record<string, Partial<SubscriptionPlan>>>({})
  const [renewals, setRenewals] = useState<readonly ManualRenewal[]>(MANUAL_RENEWALS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edits, setEdits] = useState<PlanEdits>({ name: '', monthlyPrice: '', productLimit: '', employeeLimit: '' })
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [renewOpen, setRenewOpen] = useState(false)
  const [renewMerchant, setRenewMerchant] = useState(RENEWAL_MERCHANTS[0])
  const [renewPlan, setRenewPlan] = useState('أساسية')
  const [renewDuration, setRenewDuration] = useState<'شهر' | 'سنة'>('شهر')
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const plans = useMemo(
    () => SUBSCRIPTION_PLANS.map((plan) => ({ ...plan, ...overrides[plan.id] })),
    [overrides],
  )

  const activePlans = plans.filter((plan) => !plan.archived)
  const archivedPlans = plans.filter((plan) => plan.archived)
  /** «الأكثر اشتراكاً» مشتق من العدد الفعلي لا موسوم يدوياً */
  const mostSubscribedId = activePlans.reduce<SubscriptionPlan | null>(
    (best, plan) => (best === null || plan.subscribers > best.subscribers ? plan : best),
    null,
  )?.id

  const editingPlan = plans.find((plan) => plan.id === editingId) ?? null
  const archivePlan = plans.find((plan) => plan.id === archiveId) ?? null

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id)
    setEdits({
      name: plan.name,
      monthlyPrice: String(plan.monthlyPrice),
      productLimit: String(plan.productLimit),
      employeeLimit: String(plan.employeeLimit),
    })
  }

  const saveEdit = () => {
    if (!editingPlan) return
    setOverrides((prev) => ({
      ...prev,
      [editingPlan.id]: {
        ...prev[editingPlan.id],
        name: edits.name.trim() === '' ? editingPlan.name : edits.name.trim(),
        monthlyPrice: Number(edits.monthlyPrice) || 0,
        productLimit: Number(edits.productLimit) || 0,
        employeeLimit: Number(edits.employeeLimit) || 0,
      },
    }))
    setToast(`حُدّثت باقة «${edits.name || editingPlan.name}» (معاينة محلية — لا حفظ فعلياً)`)
    setEditingId(null)
  }

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <article
      className={`apln-card${plan.archived ? ' apln-card--archived' : plan.id === mostSubscribedId ? ' apln-card--popular' : ''}`}
      key={plan.id}
    >
      <div className="apln-card__head">
        <span className="apln-card__name">{plan.name}</span>
        {plan.archived ? (
          <Badge variant="neutral">مؤرشفة</Badge>
        ) : (
          plan.id === mostSubscribedId && <Badge variant="info">الأكثر اشتراكاً</Badge>
        )}
      </div>
      <p className="apln-card__price">
        <span className="numeric">{plan.monthlyPrice}</span> د.ل
        {plan.monthlyPrice > 0 && <span className="apln-card__period"> / شهرياً</span>}
      </p>
      <ul className="apln-limits">
        <li>
          <span className="apln-limits__mark" aria-hidden="true">
            ✓
          </span>
          حتى <span className="numeric">{plan.productLimit}</span> منتجاً
        </li>
        <li>
          <span className="apln-limits__mark" aria-hidden="true">
            ✓
          </span>
          حتى <span className="numeric">{plan.employeeLimit}</span> من الموظفين
        </li>
        <li>
          <span className="apln-limits__mark" aria-hidden="true">
            ✓
          </span>
          نطاق فرعي على <span className="ltr">tawa.ly</span>
        </li>
      </ul>
      <p className="apln-card__subs">
        <span className="numeric">{plan.subscribers}</span> مشتركاً
        {plan.archived && ' — لا تقبل اشتراكات جديدة، والمشتركون الحاليون مستمرون'}
      </p>
      {!plan.archived && (
        <div className="apln-card__actions">
          <Button variant="secondary" size="sm" aria-label={`تعديل باقة ${plan.name}`} onClick={() => openEdit(plan)}>
            تعديل
          </Button>
          <Button variant="ghost" size="sm" aria-label={`أرشفة باقة ${plan.name}`} onClick={() => setArchiveId(plan.id)}>
            أرشفة
          </Button>
        </div>
      )}
    </article>
  )

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<Sidebar brand={<AdminBrand />} groups={buildAdminNav('plans')} />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title="باقات الاشتراك"
        description="خطط المنصة بحدودها وأسعارها؛ أرشفة الباقة تمنع التقديم الجديد مع بقاء المشتركين الحاليين"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'باقات الاشتراك' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />}>
            باقة جديدة
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (تعديلات محلية على بيانات تجريبية، لا حفظ فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="apln-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {(Object.keys(overrides).length > 0 || renewals.length !== MANUAL_RENEWALS.length) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setOverrides({})
                setRenewals(MANUAL_RENEWALS)
              }}
            >
              إعادة ضبط التعديلات المحلية
            </Button>
          )}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div className="apln-grid" aria-hidden="true">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Skeleton key={plan.id} variant="rect" height={280} />
          ))}
        </div>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState description="تعذّر جلب باقات الاشتراك — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <>
          <Alert variant="info" title="قائمة حدود الباقة النهائية قرار منتج معلّق (G6)">
            نعرض الحدود المشتقة من مزايا موثقة (عدد المنتجات وعدد الموظفين والنطاق الفرعي) — أي حدود أخرى تُضاف بعد حسم
            القرار، ولا نخترعها الآن.
          </Alert>

          <div className="apln-grid">{activePlans.map(renderPlanCard)}</div>

          {archivedPlans.length > 0 && (
            <section style={{ display: 'grid', gap: 'var(--space-md)' }} aria-labelledby="apln-archived">
              <h2 id="apln-archived" style={{ fontSize: 'var(--type-h3)' }}>
                الباقات المؤرشفة
              </h2>
              <div className="apln-grid">{archivedPlans.map(renderPlanCard)}</div>
            </section>
          )}

          <section style={{ display: 'grid', gap: 'var(--space-md)', minWidth: 0 }} aria-labelledby="apln-renewals">
            <div className="apln-section-head">
              <h2 id="apln-renewals" style={{ fontSize: 'var(--type-h3)' }}>
                تجديدات يدوية أخيرة
              </h2>
              <Button variant="secondary" icon={<PlusGlyph />} onClick={() => setRenewOpen(true)}>
                تجديد يدوي
              </Button>
            </div>
            <DataTable
              caption="تجديدات الاشتراكات اليدوية بعد استلام السداد — بيانات تجريبية للعرض"
              columns={RENEWAL_COLUMNS}
              rows={renewals}
              rowKey={(row) => row.id}
            />
          </section>
        </>
      )}

      <Drawer
        open={editingPlan !== null}
        onClose={() => setEditingId(null)}
        title={editingPlan ? `تعديل باقة — ${editingPlan.name}` : 'تعديل باقة'}
        footer={
          <>
            <Button variant="primary" onClick={saveEdit}>
              حفظ التغييرات
            </Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}>
              إلغاء
            </Button>
          </>
        }
      >
        {editingPlan && (
          <>
            <Input label="اسم الباقة" value={edits.name} onChange={(event) => setEdits((prev) => ({ ...prev, name: event.target.value }))} />
            <Input
              label="السعر الشهري (د.ل)"
              type="number"
              min={0}
              value={edits.monthlyPrice}
              onChange={(event) => setEdits((prev) => ({ ...prev, monthlyPrice: event.target.value }))}
            />
            <Input
              label="حد عدد المنتجات"
              type="number"
              min={0}
              value={edits.productLimit}
              onChange={(event) => setEdits((prev) => ({ ...prev, productLimit: event.target.value }))}
            />
            <Input
              label="حد عدد الموظفين"
              type="number"
              min={0}
              value={edits.employeeLimit}
              onChange={(event) => setEdits((prev) => ({ ...prev, employeeLimit: event.target.value }))}
            />
            <Alert variant="warning" title="أثر التعديل على المشتركين الحاليين غير محسوم">
              تخفيض حد تحت استخدام تاجر فعلي (منتجاته أكثر من الحد الجديد) سلوكه غير معرّف في المتطلبات — يُحسم قبل
              التنفيذ الفعلي.
            </Alert>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={archivePlan !== null}
        title={archivePlan ? `أرشفة باقة ${archivePlan.name}` : 'أرشفة الباقة'}
        impact={
          archivePlan
            ? `ستمنع الأرشفة أي تقديم جديد على هذه الباقة، ويستمر مشتركوها الحاليون (${archivePlan.subscribers}) دون تغيير (م.1.3.11ب) — التنفيذ الفعلي مع الربط الخلفي (معاينة محلية).`
            : ''
        }
        confirmLabel="أرشفة الباقة"
        onConfirm={() => {
          if (!archivePlan) return
          setOverrides((prev) => ({ ...prev, [archivePlan.id]: { ...prev[archivePlan.id], archived: true } }))
          setToast(`أُرشفت باقة «${archivePlan.name}» (معاينة محلية)`)
          setArchiveId(null)
        }}
        onCancel={() => setArchiveId(null)}
      />

      <Modal
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="تجديد اشتراك يدوياً"
        footer={
          <>
            <Button
              variant="primary"
              onClick={() => {
                setRenewals((prev) => [
                  {
                    id: `rn-local-${prev.length + 1}`,
                    merchantName: renewMerchant,
                    planName: renewPlan,
                    paidAt: 'اليوم',
                    duration: renewDuration,
                    executedBy: 'جواد',
                  },
                  ...prev,
                ])
                setToast(`جُدّد اشتراك ${renewMerchant} لمدة ${renewDuration} (معاينة محلية — لا تفعيل فعلياً)`)
                setRenewOpen(false)
              }}
            >
              تأكيد التجديد
            </Button>
            <Button variant="secondary" onClick={() => setRenewOpen(false)}>
              إلغاء
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          <Select label="التاجر" value={renewMerchant} onChange={(event) => setRenewMerchant(event.target.value)}>
            {RENEWAL_MERCHANTS.map((merchant) => (
              <option key={merchant} value={merchant}>
                {merchant}
              </option>
            ))}
          </Select>
          <Select label="الباقة" value={renewPlan} onChange={(event) => setRenewPlan(event.target.value)}>
            {SUBSCRIPTION_PLANS.filter((plan) => !plan.archived).map((plan) => (
              <option key={plan.id} value={plan.name}>
                {plan.name}
              </option>
            ))}
          </Select>
          <Select label="مدة التمديد" value={renewDuration} onChange={(event) => setRenewDuration(event.target.value as 'شهر' | 'سنة')}>
            <option value="شهر">شهر</option>
            <option value="سنة">سنة</option>
          </Select>
          <Alert variant="info" title="يُفعَّل فور التأكيد بعد استلام السداد">
            التجديد اليدوي يمدّد اشتراك التاجر مباشرة (م.1.3.12) — السداد يجري خارج المنصة، وتُسجَّل العملية في سجل
            التدقيق.
          </Alert>
        </div>
      </Modal>

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
