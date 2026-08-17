import type { DiscountRule } from '../../../types/discount'

/**
 * بيانات تجريبية محلية لشاشة «الخصومات» — للعرض والتصفية المحلية فقط.
 *
 * **مواءمة الباكند (17 أغسطس 2026):** الأعمدة من جدول `discounts`:
 * `code` (فريد لكل متجر) · `type` = fixed|percentage · `value` ·
 * `min_order_amount` · `max_discount_amount` · `usage_limit`/`used_count` ·
 * `starts_at`/`ends_at` · `is_active`.
 *
 * ملاحظة عقدية: **لا مسار تعديل (`PUT`) للخصومات** في الباكند —
 * المتاح: إنشاء · حذف · التحقق من الكود. لذا لا نعرض زر «تعديل».
 */

export interface MerchantDiscount extends DiscountRule {
  id: string
  /** اسم داخلي للعرض في اللوحة (ليس عموداً في الباكند — يُعرض الكود نفسه) */
  title: string
}

export const MERCHANT_DISCOUNTS: readonly MerchantDiscount[] = [
  {
    id: 'd1',
    title: 'خصم افتتاح المتجر',
    code: 'WELCOME10',
    type: 'fixed',
    value: 10,
    minOrderAmount: 50,
    usageLimit: 100,
    usedCount: 14,
    isActive: true,
    startsAt: '1 أغسطس',
    endsAt: '20 أغسطس',
  },
  {
    id: 'd2',
    title: 'عرض منتصف الشهر',
    code: 'MID5',
    type: 'fixed',
    value: 5,
    minOrderAmount: 30,
    usedCount: 6,
    isActive: true,
    startsAt: '10 أغسطس',
    endsAt: '18 أغسطس',
  },
  {
    id: 'd3',
    title: 'خصم العيد',
    code: 'EID15',
    type: 'percentage',
    value: 15,
    minOrderAmount: 80,
    maxDiscountAmount: 40,
    usageLimit: 50,
    usedCount: 32,
    isActive: true,
    startsAt: '5 يونيو',
    endsAt: '12 يونيو',
    expired: true,
  },
  {
    id: 'd4',
    title: 'عرض العودة للمدارس',
    code: 'SCHOOL20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 40,
    maxDiscountAmount: 25,
    usedCount: 0,
    isActive: true,
    startsAt: '25 أغسطس',
    endsAt: '10 سبتمبر',
  },
  {
    id: 'd5',
    title: 'خصم نهاية الأسبوع',
    code: 'WEEKEND7',
    type: 'fixed',
    value: 7,
    minOrderAmount: 35,
    usedCount: 11,
    isActive: false,
    startsAt: '7 أغسطس',
    endsAt: '9 أغسطس',
    expired: true,
  },
  {
    id: 'd6',
    title: 'عرض رمضان',
    code: 'RAMADAN20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 100,
    maxDiscountAmount: 60,
    usageLimit: 60,
    usedCount: 58,
    isActive: true,
    startsAt: '1 مارس',
    endsAt: '30 مارس',
    expired: true,
  },
  {
    id: 'd7',
    title: 'خصم الزبائن الأوفياء',
    code: 'LOYAL12',
    type: 'fixed',
    value: 12,
    minOrderAmount: 60,
    usageLimit: 20,
    usedCount: 20,
    isActive: true,
    startsAt: '12 أغسطس',
    endsAt: '31 أغسطس',
  },
]

/** الحالة المعروضة مشتقة من is_active وانتهاء الفترة (لا عمود حالة في الباكند) */
export function discountState(discount: MerchantDiscount): 'active' | 'ended' {
  return discount.isActive && !discount.expired ? 'active' : 'ended'
}
