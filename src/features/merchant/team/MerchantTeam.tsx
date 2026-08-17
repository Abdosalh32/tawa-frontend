import { useEffect, useMemo, useState } from 'react'
import './team.css'
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
  Select,
  Sidebar,
  Skeleton,
  Toast,
  Topbar,
} from '../../../components/ui'
import type { DataTableColumn } from '../../../components/ui'
import { PlusGlyph } from '../../../components/ui/icons'
import { STAFF_STATUS } from '../../../types/status'
import { StoreBrand } from '../StoreBrand'
import { buildMerchantNav } from '../merchant-nav'
import { PERMISSION_GROUPS, ROLE_LABEL, ROLE_PERMISSIONS, TEAM_MEMBERS, validateInvite } from './team-data'
import type { InviteErrors, PermissionKey, TeamMember, TeamRole } from './team-data'

/** الأدوار القابلة للإسناد — «مالك المتجر» متأصل ولا يُسند بدعوة */
const ASSIGNABLE_ROLES: readonly TeamRole[] = ['Store Manager', 'Inventory Manager', 'Order Processor']

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'empty' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'empty', label: 'لا موظفين بعد' },
  { value: 'error', label: 'خطأ' },
]

/** عرض صلاحيات الدور للقراءة — مشتقة من role_has_permissions في الباكند */
function RolePermissionsPreview({ role }: { role: TeamRole }) {
  const granted = new Set<PermissionKey>(ROLE_PERMISSIONS[role])
  return (
    <div className="team-matrix">
      {PERMISSION_GROUPS.map((group) => {
        const items = group.items.filter((item) => granted.has(item.key))
        if (items.length === 0) return null
        return (
          <div className="team-matrix__row" key={group.group}>
            <span style={{ fontWeight: 600 }}>{group.group}</span>
            <span className="team-perms">
              {items.map((item) => (
                <span className="team-perm" key={item.key}>
                  {item.label}
                </span>
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function MerchantTeam() {
  const [view, setView] = useState<ScreenView>('normal')
  /** تعديلات محلية فوق البيانات التجريبية — لا دعوات ولا تعطيل فعلياً */
  const [members, setMembers] = useState<readonly TeamMember[]>(TEAM_MEMBERS)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('Order Processor')
  const [inviteErrors, setInviteErrors] = useState<InviteErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<TeamRole>('Order Processor')
  const [suspendId, setSuspendId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const editingMember = members.find((member) => member.id === editingId) ?? null
  const suspendMember = members.find((member) => member.id === suspendId) ?? null
  const rows = view === 'empty' ? members.filter((member) => member.role === 'Store Owner') : members

  const sendInvite = () => {
    const errors = validateInvite(inviteName, inviteEmail, invitePhone)
    setInviteErrors(errors)
    if (Object.keys(errors).length > 0) return
    setMembers((prev) => [
      ...prev,
      {
        id: `t-local-${prev.length + 1}`,
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        phone: invitePhone.trim(),
        role: inviteRole,
        status: 'invited',
        lastActivity: '—',
        permissions: ROLE_PERMISSIONS[inviteRole],
      },
    ])
    setToast(`أُرسلت دعوة إلى ${inviteEmail.trim()} بدور «${ROLE_LABEL[inviteRole]}» (معاينة محلية)`)
    setInviteOpen(false)
    setInviteName('')
    setInviteEmail('')
    setInvitePhone('')
    setInviteRole('Order Processor')
    setInviteErrors({})
  }

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id)
    setEditRole(member.role)
  }

  const saveRole = () => {
    if (!editingMember) return
    setMembers((prev) =>
      prev.map((member) =>
        member.id === editingMember.id ? { ...member, role: editRole, permissions: ROLE_PERMISSIONS[editRole] } : member,
      ),
    )
    setToast(`صار دور ${editingMember.name} «${ROLE_LABEL[editRole]}» (معاينة محلية)`)
    setEditingId(null)
  }

  const columns: ReadonlyArray<DataTableColumn<TeamMember>> = useMemo(
    () => [
      {
        key: 'member',
        header: 'الموظف',
        cell: (row) => (
          <span className="team-member">
            <span className="team-avatar" aria-hidden="true">
              {row.name.trim().charAt(0)}
            </span>
            <span className="team-member__info">
              <span className="team-member__name">{row.name}</span>
              <span className="team-member__email ltr">{row.email}</span>
              <span className="team-member__email ltr">{row.phone}</span>
            </span>
          </span>
        ),
      },
      { key: 'role', header: 'الدور', cell: (row) => ROLE_LABEL[row.role] },
      {
        key: 'permissions',
        header: 'الصلاحيات',
        cell: (row) =>
          row.role === 'Store Owner' ? (
            <span className="team-perms">
              <span className="team-perm team-perm--all">وصول كامل</span>
            </span>
          ) : row.permissions.length === 0 ? (
            <span className="team-perms__none">لا صلاحيات</span>
          ) : (
            <span className="team-perms">
              <span className="team-perm">
                <span className="numeric">{row.permissions.length}</span> صلاحية
              </span>
            </span>
          ),
      },
      { key: 'activity', header: 'آخر نشاط', cell: (row) => row.lastActivity },
      {
        key: 'status',
        header: 'الحالة',
        cell: (row) => <Badge variant={STAFF_STATUS[row.status].variant}>{STAFF_STATUS[row.status].label}</Badge>,
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        cell: (row) =>
          row.role === 'Store Owner' ? (
            <span className="team-perms__none">—</span>
          ) : (
            <span className="team-actions">
              {row.status === 'invited' && (
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label={`إعادة إرسال الدعوة إلى ${row.name}`}
                  onClick={() => setToast(`أُعيد إرسال الدعوة إلى ${row.email} (معاينة محلية)`)}
                >
                  إعادة إرسال
                </Button>
              )}
              {row.status !== 'suspended' && (
                <>
                  <Button variant="secondary" size="sm" aria-label={`تغيير دور ${row.name}`} onClick={() => openEdit(row)}>
                    الدور
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`تعطيل حساب ${row.name}`} onClick={() => setSuspendId(row.id)}>
                    تعطيل
                  </Button>
                </>
              )}
            </span>
          ),
      },
    ],
    [],
  )

  return (
    <AppShell
      context="merchant"
      className="team-shell"
      sidebar={<Sidebar brand={<StoreBrand />} groups={buildMerchantNav('team')} />}
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
        title="فريق العمل"
        description="ادعُ موظفيك بالبريد وأسند لكل منهم دوراً محدد الصلاحيات؛ التعطيل يسحب الوصول فوراً"
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'فريق العمل' }]} />}
        primaryAction={
          <Button variant="primary" icon={<PlusGlyph />} onClick={() => setInviteOpen(true)}>
            دعوة موظف
          </Button>
        }
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (تعديلات محلية على بيانات تجريبية، لا دعوات ولا تعطيل فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="team-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
          {members.length !== TEAM_MEMBERS.length && (
            <Button variant="secondary" size="sm" onClick={() => setMembers(TEAM_MEMBERS)}>
              إعادة ضبط الفريق التجريبي
            </Button>
          )}
        </div>
      </fieldset>

      <Alert variant="info" title="نموذج الصلاحيات محسوم من الباكند">
        أربعة أدوار جاهزة (مالك المتجر · مدير المتجر · مدير المخزون · مسؤول الطلبات) و20 صلاحية بحبيبية الإجراء — تُسند
        بالدور لا بمفاتيح منفصلة، والصلاحيات المعروضة مشتقة من الدور.
      </Alert>

      {view === 'loading' ? (
        <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <Skeleton variant="rect" height={44} />
          <Skeleton variant="rect" height={260} />
        </div>
      ) : view === 'error' ? (
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)' }}>
          <ErrorState description="تعذّر جلب أعضاء الفريق — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <DataTable
          caption="أعضاء فريق العمل وأدوارهم — بيانات تجريبية للعرض"
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          emptyState={
            <EmptyState
              title="لا موظفين في فريقك بعد"
              description="ادعُ موظفاً بالبريد وأسند له دوراً ليساعدك في إدارة الطلبات والمخزون."
              action={
                <Button variant="primary" icon={<PlusGlyph />} onClick={() => setInviteOpen(true)}>
                  دعوة موظف
                </Button>
              }
            />
          }
        />
      )}

      <Drawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="دعوة موظف جديد"
        footer={
          <>
            <Button variant="primary" onClick={sendInvite}>
              إرسال الدعوة
            </Button>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              إلغاء
            </Button>
          </>
        }
      >
        <Input
          label="اسم الموظف"
          value={inviteName}
          error={inviteErrors.name}
          onChange={(event) => setInviteName(event.target.value)}
        />
        <Input
          label="البريد الإلكتروني"
          type="email"
          helperText="تُرسل الدعوة إليه ليقبلها وينشئ كلمة مروره (1.5.7)"
          value={inviteEmail}
          error={inviteErrors.email}
          onChange={(event) => setInviteEmail(event.target.value)}
        />
        <Input
          label="رقم الهاتف"
          type="tel"
          value={invitePhone}
          error={inviteErrors.phone}
          onChange={(event) => setInvitePhone(event.target.value)}
        />
        <Select label="الدور" value={inviteRole} onChange={(event) => setInviteRole(event.target.value as TeamRole)}>
          {ASSIGNABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABEL[role]}
            </option>
          ))}
        </Select>
        <div>
          <p className="tw-field__label">صلاحيات هذا الدور</p>
          <RolePermissionsPreview role={inviteRole} />
        </div>
      </Drawer>

      <Drawer
        open={editingMember !== null}
        onClose={() => setEditingId(null)}
        title={editingMember ? `دور ${editingMember.name}` : 'تغيير الدور'}
        footer={
          <>
            <Button variant="primary" onClick={saveRole}>
              حفظ الدور
            </Button>
            <Button variant="secondary" onClick={() => setEditingId(null)}>
              إلغاء
            </Button>
          </>
        }
      >
        {editingMember && (
          <>
            <p style={{ fontSize: 'var(--type-caption)', color: 'var(--text-secondary)' }}>
              <span className="ltr">{editingMember.email}</span> · <span className="ltr">{editingMember.phone}</span>
            </p>
            <Select label="الدور" value={editRole} onChange={(event) => setEditRole(event.target.value as TeamRole)}>
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </Select>
            <div>
              <p className="tw-field__label">صلاحيات هذا الدور</p>
              <RolePermissionsPreview role={editRole} />
            </div>
            <p style={{ fontSize: 'var(--type-caption)', color: 'var(--text-secondary)' }}>
              البنود غير المصرَّح بها تُخفى من ملاحة الموظف ولا تُعطَّل فقط.
            </p>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={suspendMember !== null}
        title={suspendMember ? `تعطيل حساب ${suspendMember.name}` : 'تعطيل الحساب'}
        impact={
          suspendMember
            ? `سيفقد (${suspendMember.name}) الوصول إلى لوحة التحكم فوراً وتُسحب كل صلاحياته (1.5.9) — التنفيذ الفعلي مع الربط الخلفي (معاينة محلية).`
            : ''
        }
        confirmLabel="تعطيل الحساب"
        onConfirm={() => {
          if (!suspendMember) return
          setMembers((prev) =>
            prev.map((member) => (member.id === suspendMember.id ? { ...member, status: 'suspended', permissions: [] } : member)),
          )
          setToast(`عُطّل حساب ${suspendMember.name} وسُحبت صلاحياته (معاينة محلية)`)
          setSuspendId(null)
        }}
        onCancel={() => setSuspendId(null)}
      />

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AppShell>
  )
}
