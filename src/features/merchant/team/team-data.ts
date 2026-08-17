import type { StaffStatus } from '../../../types/status'

/**
 * بيانات وأنواع فريق العمل (1.5.7 – 1.5.9) — محلية بالكامل، لا دعوات فعلية.
 *
 * **مواءمة الباكند (17 أغسطس 2026):** حُسم G2/D10 —
 * أربعة أدوار جاهزة في `RolePermissionSeeder` و20 صلاحية بحبيبية الإجراء
 * (`products.create` …)، و`store_staff.role_name` يحمل اسم الدور،
 * ودعوة الموظف تطلب الاسم والهاتف إلزاماً (`InviteStaffRequest`).
 * المفاتيح أدناه مطابقة حرفياً لأسماء الصلاحيات والأدوار في الباكند.
 */

/** أسماء الصلاحيات كما في permissions بالباكند */
export type PermissionKey =
  | 'products.view' | 'products.create' | 'products.edit' | 'products.archive'
  | 'inventory.update' | 'inventory.reserve' | 'inventory.alerts'
  | 'discounts.view' | 'discounts.create' | 'discounts.edit' | 'discounts.delete'
  | 'orders.view' | 'orders.update_status' | 'orders.cancel'
  | 'team.invite' | 'team.update_role' | 'team.suspend' | 'roles.manage'
  | 'store.settings.edit'

/** مجموعات العرض — التسميات عربية والمفاتيح من الباكند */
export const PERMISSION_GROUPS: ReadonlyArray<{
  group: string
  items: ReadonlyArray<{ key: PermissionKey; label: string }>
}> = [
  {
    group: 'المنتجات والتصنيفات',
    items: [
      { key: 'products.view', label: 'عرض' },
      { key: 'products.create', label: 'إضافة' },
      { key: 'products.edit', label: 'تعديل' },
      { key: 'products.archive', label: 'أرشفة' },
    ],
  },
  {
    group: 'المخزون',
    items: [
      { key: 'inventory.update', label: 'تعديل الكميات' },
      { key: 'inventory.reserve', label: 'الحجز والتحرير' },
      { key: 'inventory.alerts', label: 'تنبيهات النقص' },
    ],
  },
  {
    group: 'الخصومات',
    items: [
      { key: 'discounts.view', label: 'عرض' },
      { key: 'discounts.create', label: 'إنشاء' },
      { key: 'discounts.edit', label: 'تعديل' },
      { key: 'discounts.delete', label: 'حذف' },
    ],
  },
  {
    group: 'الطلبات',
    items: [
      { key: 'orders.view', label: 'عرض' },
      { key: 'orders.update_status', label: 'تحديث الحالة' },
      { key: 'orders.cancel', label: 'الإلغاء' },
    ],
  },
  {
    group: 'الفريق والأدوار',
    items: [
      { key: 'team.invite', label: 'دعوة موظف' },
      { key: 'team.update_role', label: 'تغيير الأدوار' },
      { key: 'team.suspend', label: 'تعطيل حساب' },
      { key: 'roles.manage', label: 'إدارة الأدوار' },
    ],
  },
  {
    group: 'إعدادات المتجر',
    items: [{ key: 'store.settings.edit', label: 'تعديل الإعدادات' }],
  },
]

export const ALL_PERMISSIONS: readonly PermissionKey[] = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key))

/** الأدوار الأربعة من RolePermissionSeeder — role_name نصياً كما في الباكند */
export type TeamRole = 'Store Owner' | 'Store Manager' | 'Inventory Manager' | 'Order Processor'

export const ROLE_LABEL: Record<TeamRole, string> = {
  'Store Owner': 'مالك المتجر',
  'Store Manager': 'مدير المتجر',
  'Inventory Manager': 'مدير المخزون',
  'Order Processor': 'مسؤول الطلبات',
}

/** صلاحيات كل دور — منسوخة حرفياً من rolesConfig في الباكند */
export const ROLE_PERMISSIONS: Record<TeamRole, readonly PermissionKey[]> = {
  'Store Owner': ALL_PERMISSIONS,
  'Store Manager': [
    'products.view', 'products.create', 'products.edit', 'products.archive',
    'inventory.update', 'inventory.reserve', 'inventory.alerts',
    'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
    'orders.view', 'orders.update_status', 'orders.cancel',
    'store.settings.edit',
  ],
  'Inventory Manager': [
    'products.view', 'products.create', 'products.edit', 'products.archive',
    'inventory.update', 'inventory.reserve', 'inventory.alerts',
  ],
  'Order Processor': ['orders.view', 'orders.update_status', 'orders.cancel'],
}

/** حالة عضو الفريق — store_staff.status (القاموس المشترك STAFF_STATUS) */
export type MemberStatus = StaffStatus

export interface TeamMember {
  id: string
  name: string
  email: string
  /** إلزامي في InviteStaffRequest */
  phone: string
  role: TeamRole
  status: MemberStatus
  lastActivity: string
  /** مشتقة من الدور (role_has_permissions) — تُعرض للتوضيح */
  permissions: readonly PermissionKey[]
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  {
    id: 't1',
    name: 'فاطمة إدريس',
    email: 'fatima@example.ly',
    phone: '+218 91 234 5678',
    role: 'Store Owner',
    status: 'active',
    lastActivity: 'الآن',
    permissions: ROLE_PERMISSIONS['Store Owner'],
  },
  {
    id: 't2',
    name: 'هدى بالخير',
    email: 'huda@example.ly',
    phone: '+218 92 707 8899',
    role: 'Order Processor',
    status: 'active',
    lastActivity: 'اليوم، 10:05 ص',
    permissions: ROLE_PERMISSIONS['Order Processor'],
  },
  {
    id: 't3',
    name: 'عبدالله قدور',
    email: 'abdullah@example.ly',
    phone: '+218 91 303 4455',
    role: 'Inventory Manager',
    status: 'active',
    lastActivity: 'أمس',
    permissions: ROLE_PERMISSIONS['Inventory Manager'],
  },
  {
    id: 't4',
    name: 'زينب العبيدي',
    email: 'zainab@example.ly',
    phone: '+218 91 808 9900',
    role: 'Store Manager',
    status: 'invited',
    lastActivity: '—',
    permissions: ROLE_PERMISSIONS['Store Manager'],
  },
  {
    id: 't5',
    name: 'يوسف الككلي',
    email: 'youssef@example.ly',
    phone: '+218 94 404 5566',
    role: 'Order Processor',
    status: 'suspended',
    lastActivity: '10 أغسطس',
    permissions: [],
  },
]

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export interface InviteErrors {
  name?: string
  email?: string
  phone?: string
}

/** يطابق قواعد InviteStaffRequest: name · email · phone إلزامية + role_name من الأربعة */
export function validateInvite(name: string, email: string, phone: string): InviteErrors {
  const errors: InviteErrors = {}
  if (name.trim() === '') {
    errors.name = 'اسم الموظف مطلوب'
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'أدخل بريداً إلكترونياً صالحاً — تُرسل إليه الدعوة'
  }
  const digits = phone.replace(/[\s-]/g, '')
  if (!/^\+?\d{9,15}$/.test(digits)) {
    errors.phone = 'رقم هاتف الموظف مطلوب وصالح'
  }
  return errors
}
