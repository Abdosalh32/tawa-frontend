import type { ModerationStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لفحص المنتجات عبر المتاجر (م.1.3.8 – م.1.3.9).
 * حقول الرقابة فقط: لا مخزون ولا SKU ولا بيانات تشغيلية للتاجر.
 * لا تُستورد خارج هذه الميزة.
 */

export interface ModerationProduct {
  id: string
  name: string
  storeName: string
  storeSubdomain: string
  price: number
  status: ModerationStatus
  /** سبب المخالفة المسجّل + الدليل المرسل للتاجر (م.1.3.9) */
  violation?: { reason: string; evidence: string }
}

/** أسباب المخالفة (برومت 19: قائمة منسدلة) */
export const VIOLATION_REASONS: readonly string[] = [
  'منتج محظور بالقوانين',
  'وصف مضلّل',
  'صور مخالفة',
  'أخرى',
]

export const MODERATION_PRODUCTS: readonly ModerationProduct[] = [
  { id: 'm1', name: 'شامبو أرغان 400مل', storeName: 'متجر العافية', storeSubdomain: 'alafya.tawa.ly', price: 45, status: 'pending' },
  { id: 'm2', name: 'ساعة يد فاخرة (تقليد)', storeName: 'سوق الخير', storeSubdomain: 'alkhair.tawa.ly', price: 180, status: 'pending' },
  { id: 'm3', name: 'قميص قطني رجالي', storeName: 'متجر العافية', storeSubdomain: 'alafya.tawa.ly', price: 55, status: 'ok' },
  { id: 'm4', name: 'مكمّل غذائي غير مرخّص', storeName: 'إلكترونيات المدينة', storeSubdomain: 'madina-tech.tawa.ly', price: 95, status: 'violating', violation: { reason: 'منتج محظور بالقوانين', evidence: 'المنتج يحتاج ترخيصاً صحياً غير مرفق.' } },
  { id: 'm5', name: 'سجادة صلاة مخملية', storeName: 'ركن الهدايا', storeSubdomain: 'hadaya.tawa.ly', price: 35, status: 'pending' },
  { id: 'm6', name: 'عطر العود الملكي 50مل', storeName: 'عطور الشرق', storeSubdomain: 'sharq.tawa.ly', price: 260, status: 'pending' },
  { id: 'm7', name: 'شاحن سريع مجهول المصدر', storeName: 'إلكترونيات المدينة', storeSubdomain: 'madina-tech.tawa.ly', price: 40, status: 'pending' },
  { id: 'm8', name: 'كريم زبدة الشيا', storeName: 'متجر العافية', storeSubdomain: 'alafya.tawa.ly', price: 18, status: 'ok' },
  { id: 'm9', name: 'دفتر رسم A4', storeName: 'مكتبة الأندلس', storeSubdomain: 'andalus.tawa.ly', price: 12, status: 'pending' },
  { id: 'm10', name: 'حلويات منزلية مشكّلة', storeName: 'حلويات سعاد', storeSubdomain: 'souad-sweets.tawa.ly', price: 30, status: 'pending' },
  { id: 'm11', name: 'نظارة شمسية (ماركة مقلّدة)', storeName: 'سوق الخير', storeSubdomain: 'alkhair.tawa.ly', price: 70, status: 'violating', violation: { reason: 'منتج محظور بالقوانين', evidence: 'استخدام علامة تجارية دون تفويض.' } },
  { id: 'm12', name: 'مبخرة خزفية مزخرفة', storeName: 'ركن الهدايا', storeSubdomain: 'hadaya.tawa.ly', price: 48, status: 'pending' },
]

/** متاجر متكررة المخالفات (برومت 19: شريط جانبي) — مشتق من المنتجات */
export function repeatOffenders(products: readonly ModerationProduct[]) {
  const counts = new Map<string, number>()
  for (const product of products) {
    if (product.status !== 'violating') continue
    counts.set(product.storeName, (counts.get(product.storeName) ?? 0) + 1)
  }
  return [...counts.entries()].map(([storeName, count]) => ({ storeName, count })).sort((a, b) => b.count - a.count)
}
