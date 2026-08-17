/**
 * قواعد الخصم — مطابقة لعقد الباكند (جدول `discounts` و`DiscountRequest`).
 *
 * حُسم D9 من الباكند (17 أغسطس 2026): الخصم **بكود** إلزامي، ونوعان
 * `fixed` (مبلغ ثابت) و`percentage` (نسبة مئوية بسقف اختياري)، مع حد أدنى
 * لقيمة الطلب وحد أعلى لعدد الاستخدامات وفترة سريان.
 *
 * التقييم أدناه محلي ويحاكي دلالات `POST /v1/merchant/stores/{id}/discounts/validate`
 * — لا نداء شبكة، ولا قواعد مخترعة خارج أعمدة الجدول.
 */

export type DiscountType = 'fixed' | 'percentage'

/** يقابل صفاً في جدول discounts (الحقول التي يستهلكها التقييم) */
export interface DiscountRule {
  code: string
  type: DiscountType
  /** المبلغ بالدينار للنوع fixed، أو النسبة للنوع percentage */
  value: number
  minOrderAmount: number
  /** سقف الخصم — للنسبة المئوية فقط (max_discount_amount) */
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  isActive: boolean
  /** نصوص عرض للفترة؛ `expired` هو ما يحكم التقييم محلياً */
  startsAt?: string
  endsAt?: string
  expired?: boolean
}

export type DiscountCheck =
  | { status: 'ok'; amount: number; rule: DiscountRule }
  | { status: 'not_found' | 'inactive' | 'expired' | 'limit_reached' }
  | { status: 'min_not_met'; minOrderAmount: number }

/** رسائل عربية موحدة لكل نتيجة تحقق */
export const DISCOUNT_MESSAGE: Record<Exclude<DiscountCheck['status'], 'ok'>, string> = {
  not_found: 'كود الخصم غير موجود — تأكد من كتابته',
  inactive: 'كود الخصم موقوف حالياً',
  expired: 'انتهت فترة سريان هذا الكود',
  limit_reached: 'استُنفد عدد استخدامات هذا الكود',
  min_not_met: 'قيمة سلتك أقل من الحد الأدنى لهذا الكود',
}

/** خصم النسبة يُقرَّب لأقرب دينار ولا يتجاوز السقف ولا مجموع السلة */
export function computeDiscountAmount(rule: DiscountRule, subtotal: number): number {
  const raw = rule.type === 'fixed' ? rule.value : (subtotal * rule.value) / 100
  const capped = rule.maxDiscountAmount !== undefined ? Math.min(raw, rule.maxDiscountAmount) : raw
  return Math.min(Math.round(capped), subtotal)
}

export function evaluateDiscount(code: string, subtotal: number, catalog: readonly DiscountRule[]): DiscountCheck {
  const wanted = code.trim().toUpperCase()
  const rule = catalog.find((item) => item.code.toUpperCase() === wanted)
  if (!rule) return { status: 'not_found' }
  if (!rule.isActive) return { status: 'inactive' }
  if (rule.expired) return { status: 'expired' }
  if (rule.usageLimit !== undefined && rule.usedCount >= rule.usageLimit) return { status: 'limit_reached' }
  if (subtotal < rule.minOrderAmount) return { status: 'min_not_met', minOrderAmount: rule.minOrderAmount }
  return { status: 'ok', amount: computeDiscountAmount(rule, subtotal), rule }
}

/** وصف قيمة الخصم للعرض (بلا حساب) */
export function describeDiscountValue(rule: Pick<DiscountRule, 'type' | 'value' | 'maxDiscountAmount'>): string {
  if (rule.type === 'fixed') return `${rule.value} د.ل`
  return rule.maxDiscountAmount !== undefined ? `${rule.value}% (بحد أقصى ${rule.maxDiscountAmount} د.ل)` : `${rule.value}%`
}
