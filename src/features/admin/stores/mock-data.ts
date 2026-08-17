import type { StoreStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لإدارة المتاجر (م.1.3.4 – م.1.3.7) — للعرض والقرار المحلي فقط.
 * لا تُستورد خارج هذه الميزة.
 * «الباقة» معروضة هنا لأن اشتراك المتجر القائم كيان موثق (م.1.3.12 يجدّده) —
 * بخلاف شاشة الاعتماد حيث اختيار الباقة عند التقديم قرار مفقود (M2).
 */

export interface AdminStore {
  id: string
  storeName: string
  merchantName: string
  subdomain: string
  planName: string
  productCount: number
  registeredAt: string
  lastActivity: string
  /** عدد المخالفات المسجّلة سابقاً (م.1.3.9) */
  violations: number
  status: StoreStatus
  /** سبب التعليق المكتوب + مدته (م.1.3.4، برومت 18) */
  suspension?: { reason: string; sinceDays: number }
}

export const ADMIN_STORES: readonly AdminStore[] = [
  {
    id: 'st1',
    storeName: 'متجر العافية',
    merchantName: 'فاطمة إدريس',
    subdomain: 'alafya.tawa.ly',
    planName: 'احترافية',
    productCount: 42,
    registeredAt: '12 أغسطس',
    lastActivity: 'اليوم',
    violations: 0,
    status: 'active',
  },
  {
    id: 'st2',
    storeName: 'سوق الخير',
    merchantName: 'سالم القمودي',
    subdomain: 'alkhair.tawa.ly',
    planName: 'أساسية',
    productCount: 18,
    registeredAt: '2 أغسطس',
    lastActivity: 'أمس',
    violations: 1,
    status: 'suspended',
    suspension: { reason: 'وثائق منتهية الصلاحية', sinceDays: 3 },
  },
  {
    id: 'st3',
    storeName: 'ركن الهدايا',
    merchantName: 'مريم الزوي',
    subdomain: 'hadaya.tawa.ly',
    planName: 'مجانية',
    productCount: 9,
    registeredAt: '11 أغسطس',
    lastActivity: 'اليوم',
    violations: 0,
    status: 'active',
  },
  {
    id: 'st4',
    storeName: 'إلكترونيات المدينة',
    merchantName: 'عمر الفيتوري',
    subdomain: 'madina-tech.tawa.ly',
    planName: 'أساسية',
    productCount: 63,
    registeredAt: '28 يوليو',
    lastActivity: 'قبل 4 أيام',
    violations: 3,
    status: 'banned',
  },
  {
    id: 'st5',
    storeName: 'مكتبة الأندلس',
    merchantName: 'جواد بن عيسى',
    subdomain: 'andalus.tawa.ly',
    planName: 'مجانية',
    productCount: 24,
    registeredAt: '5 أغسطس',
    lastActivity: 'أمس',
    violations: 0,
    status: 'active',
  },
  {
    id: 'st6',
    storeName: 'حلويات سعاد',
    merchantName: 'سعاد بالحاج',
    subdomain: 'souad-sweets.tawa.ly',
    planName: 'مجانية',
    productCount: 12,
    registeredAt: '9 أغسطس',
    lastActivity: 'اليوم',
    violations: 0,
    status: 'active',
  },
  {
    id: 'st7',
    storeName: 'عطور الشرق',
    merchantName: 'خالد المقريف',
    subdomain: 'sharq.tawa.ly',
    planName: 'أساسية',
    productCount: 31,
    registeredAt: '20 يوليو',
    lastActivity: 'قبل يومين',
    violations: 2,
    status: 'suspended',
    suspension: { reason: 'تكرار عرض منتجات مخالفة', sinceDays: 1 },
  },
]
