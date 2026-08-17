import type { BadgeVariant } from '../../../components/ui'

/**
 * بيانات وأنواع شاشة «إعدادات المتجر» — محلية بالكامل، لا حفظ فعلياً.
 * المصادر: 1.2.2 – 1.2.5، 1.5.6، برومت 10، م.1.3.2/م.1.3.3.
 */

export interface StoreSettingsForm {
  storeName: string
  category: string
  /** البيانات التعريفية (1.2.3) */
  description: string
  /** بيانات التواصل (برومت 10) — هاتف تواصل المتجر */
  contactPhone: string
  language: 'ar' | 'en'
}

export const INITIAL_SETTINGS: StoreSettingsForm = {
  storeName: 'متجر العافية',
  category: 'care',
  description: 'منتجات عناية شخصية طبيعية بجودة عالية وتوصيل سريع.',
  contactPhone: '+218 91 234 5678',
  language: 'ar',
}

export const ACTIVITY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'fashion', label: 'أزياء' },
  { value: 'electronics', label: 'إلكترونيات' },
  { value: 'food', label: 'غذائي' },
  { value: 'care', label: 'عناية شخصية' },
  { value: 'home', label: 'منزل وديكور' },
]

export interface SettingsErrors {
  storeName?: string
  contactPhone?: string
}

export function validateSettings(form: StoreSettingsForm): SettingsErrors {
  const errors: SettingsErrors = {}
  if (form.storeName.trim() === '') {
    errors.storeName = 'اسم المتجر مطلوب — يظهر لزبائنك في كل مكان'
  }
  const phone = form.contactPhone.replace(/[\s-]/g, '')
  if (phone !== '' && !/^\+?\d{9,15}$/.test(phone)) {
    errors.contactPhone = 'أدخل رقم هاتف تواصل صالحاً أو اترك الحقل فارغاً'
  }
  return errors
}

/**
 * الحالة المركبة التي تعرضها هذه الشاشة للتاجر — **تركيبة واجهة** من حقلين في الباكند:
 *
 * | حالة الواجهة | merchants.status      | stores.status |
 * |--------------|-----------------------|---------------|
 * | pending      | pending_verification  | draft         |
 * | approved     | active                | draft         |
 * | active       | active                | active        |
 * | maintenance  | active                | maintenance   |
 * | suspended    | suspended             | maintenance   |
 * | rejected     | — **بلا مقابل خلفي**   | draft         |
 *
 * ملاحظة: `merchants.status` ليس فيه قيمة `rejected`، فمسار رفض الاعتماد (م.1.3.3)
 * بلا تمثيل خلفي حتى بناء نطاق الاعتماد.
 */
export type StoreLifecycle = 'pending' | 'approved' | 'active' | 'maintenance' | 'suspended' | 'rejected'

export const LIFECYCLE_META: Record<StoreLifecycle, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'بانتظار اعتماد الإدارة', variant: 'warning' },
  approved: { label: 'معتمد — غير منشور', variant: 'info' },
  active: { label: 'منشور', variant: 'success' },
  maintenance: { label: 'موقوف مؤقتاً (صيانة)', variant: 'warning' },
  suspended: { label: 'الحساب معلّق من الإدارة', variant: 'error' },
  rejected: { label: 'مرفوض — مع سبب', variant: 'error' },
}

/** سبب الرفض التجريبي (م.1.3.3: يظهر السبب للتاجر ليصحح ويعيد التقديم) */
export const MOCK_REJECTION_REASON = 'وثائق التوثيق غير مكتملة — أرفق السجل التجاري كاملاً.'

/** عدد المنتجات المنشورة التجريبي (متسق مع قائمة المنتجات) */
export const MOCK_PUBLISHED_PRODUCTS = 42
