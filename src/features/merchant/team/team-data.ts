/**
 * بيانات وأنواع فريق العمل (1.5.7 – 1.5.9) — محلية بالكامل، لا دعوات فعلية.
 * التزام: قائمة الصلاحيات ومستوى حبيبيتها قرار منتج معلّق (G2) —
 * المفاتيح أدناه على مستوى وحدات موثقة في المتطلبات نفسها (طلبات، منتجات،
 * مخزون، خصومات، مظهر، إعدادات، فريق)، ولا نخترع أدواراً جاهزة غير منصوصة.
 */

export type PermissionKey = 'orders' | 'products' | 'inventory' | 'discounts' | 'appearance' | 'settings' | 'team'

export const PERMISSIONS: ReadonlyArray<{ key: PermissionKey; label: string }> = [
  { key: 'orders', label: 'الطلبات' },
  { key: 'products', label: 'المنتجات' },
  { key: 'inventory', label: 'المخزون' },
  { key: 'discounts', label: 'الخصومات' },
  { key: 'appearance', label: 'المظهر والقوالب' },
  { key: 'settings', label: 'إعدادات المتجر' },
  { key: 'team', label: 'فريق العمل' },
]

/** الدورَان المتأصلان في المتطلبات: مالك المتجر والموظف (A5) */
export type TeamRole = 'owner' | 'employee'

export const ROLE_LABEL: Record<TeamRole, string> = {
  owner: 'مالك المتجر',
  employee: 'موظف',
}

/** حالة عضو الفريق — «بانتظار قبول الدعوة» افتراض واجهة موثق (F10) */
export type MemberStatus = 'active' | 'invited' | 'disabled'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  status: MemberStatus
  lastActivity: string
  permissions: PermissionKey[]
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    id: 't1',
    name: 'فاطمة إدريس',
    email: 'fatima@example.ly',
    role: 'owner',
    status: 'active',
    lastActivity: 'الآن',
    permissions: PERMISSIONS.map((permission) => permission.key),
  },
  {
    id: 't2',
    name: 'هدى بالخير',
    email: 'huda@example.ly',
    role: 'employee',
    status: 'active',
    lastActivity: 'اليوم، 10:05 ص',
    permissions: ['orders', 'inventory'],
  },
  {
    id: 't3',
    name: 'عبدالله قدور',
    email: 'abdullah@example.ly',
    role: 'employee',
    status: 'active',
    lastActivity: 'أمس',
    permissions: ['orders', 'products', 'inventory'],
  },
  {
    id: 't4',
    name: 'زينب العبيدي',
    email: 'zainab@example.ly',
    role: 'employee',
    status: 'invited',
    lastActivity: '—',
    permissions: ['orders'],
  },
  {
    id: 't5',
    name: 'يوسف الككلي',
    email: 'youssef@example.ly',
    role: 'employee',
    status: 'disabled',
    lastActivity: '10 أغسطس',
    permissions: [],
  },
]

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export interface InviteErrors {
  email?: string
  permissions?: string
}

export function validateInvite(email: string, permissions: ReadonlySet<PermissionKey>): InviteErrors {
  const errors: InviteErrors = {}
  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'أدخل بريداً إلكترونياً صالحاً — تُرسل إليه الدعوة'
  }
  if (permissions.size === 0) {
    errors.permissions = 'اختر صلاحية واحدة على الأقل ليتمكن الموظف من العمل'
  }
  return errors
}
