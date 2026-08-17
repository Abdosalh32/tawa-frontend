/**
 * بيانات تجريبية محلية لباقات الاشتراك (م.1.3.10 – م.1.3.12) — للعرض والتعديل المحلي فقط.
 * لا تُستورد خارج هذه الميزة.
 * الحدود المعروضة: عدد المنتجات وعدد الموظفين فقط — قائمة حدود الباقة النهائية
 * قرار منتج معلّق (G6)، فلا نخترع مساحة تخزين ولا نطاقاً مخصصاً ولا أولوية دعم.
 */

export interface SubscriptionPlan {
  id: string
  name: string
  /** السعر الشهري بالدينار (0 = مجانية) */
  monthlyPrice: number
  productLimit: number
  employeeLimit: number
  /** عدد المشتركين الحاليين (م.1.3.11ب: يستمرون بعد الأرشفة) */
  subscribers: number
  archived: boolean
}

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  { id: 'p-free', name: 'مجانية', monthlyPrice: 0, productLimit: 20, employeeLimit: 1, subscribers: 38, archived: false },
  { id: 'p-basic', name: 'أساسية', monthlyPrice: 25, productLimit: 100, employeeLimit: 2, subscribers: 71, archived: false },
  { id: 'p-pro', name: 'احترافية', monthlyPrice: 50, productLimit: 500, employeeLimit: 3, subscribers: 33, archived: false },
  { id: 'p-legacy', name: 'أساسية (قديمة)', monthlyPrice: 20, productLimit: 60, employeeLimit: 2, subscribers: 12, archived: true },
]

/** تجديدات يدوية أخيرة (م.1.3.12) */
export interface ManualRenewal {
  id: string
  merchantName: string
  planName: string
  paidAt: string
  /** مدة التمديد */
  duration: 'شهر' | 'سنة'
  /** مَن نفّذ التجديد — سجل المسؤولية */
  executedBy: string
}

export const MANUAL_RENEWALS: readonly ManualRenewal[] = [
  { id: 'rn1', merchantName: 'فاطمة إدريس', planName: 'احترافية', paidAt: '16 أغسطس', duration: 'شهر', executedBy: 'جواد' },
  { id: 'rn2', merchantName: 'سالم القمودي', planName: 'أساسية', paidAt: '14 أغسطس', duration: 'سنة', executedBy: 'جواد' },
  { id: 'rn3', merchantName: 'مريم الزوي', planName: 'أساسية', paidAt: '11 أغسطس', duration: 'شهر', executedBy: 'جواد' },
]

/** تجار المعاينة لاختيارهم في التجديد اليدوي */
export const RENEWAL_MERCHANTS: readonly string[] = [
  'فاطمة إدريس',
  'سالم القمودي',
  'مريم الزوي',
  'جواد بن عيسى',
  'سعاد بالحاج',
]
