import type { PaymentStatus } from './status'

/**
 * مرآة عقد الإتمام في الباكند (`StorefrontCheckoutRequest` + مدير البوابات ومدير الشحن).
 *
 * **المفاتيح مطابقة حرفياً** لقيم `payment_method` وسائق الشحن كي يُرسل النموذج
 * ما يقبله الخادم بلا طبقة ترجمة. الأرقام هنا **للعرض فقط**: الخادم يعيد حساب
 * رسوم الشحن عند الإتمام وقيمته هي المرجع (وثيقة الفجوات §9.4).
 */

/* ═══ الدفع — `payment_method in:cod,card,tadawul,stripe,local_bank` ═══ */

export type PaymentMethod = 'cod' | 'card' | 'tadawul' | 'stripe' | 'local_bank'

export interface PaymentMethodMeta {
  label: string
  hint: string
  /** حالة الدفع التي ترجعها البوابة المقابلة بعد الشحن (COD ⇒ غير مدفوع، البقية ⇒ مدفوع) */
  resultingStatus: PaymentStatus
  /** الطريقة الوحيدة التي تطلب `payment_card_details` (required_if في العقد) */
  requiresCardDetails: boolean
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodMeta> = {
  cod: {
    label: 'كاش عند الاستلام',
    hint: 'ادفع نقداً عند استلام شحنتك — لا يُطلب أي بيان بطاقة.',
    resultingStatus: 'unpaid',
    requiresCardDetails: false,
  },
  card: {
    label: 'بطاقة مصرفية',
    hint: 'تُدفع القيمة الآن — يُطلب رقم البطاقة ورمز التحقق (CVV).',
    resultingStatus: 'paid',
    requiresCardDetails: true,
  },
  tadawul: {
    label: 'تداول / رصيد',
    hint: 'الدفع عبر شبكة المصارف المحلية.',
    resultingStatus: 'paid',
    requiresCardDetails: false,
  },
  local_bank: {
    label: 'مصرف محلي',
    hint: 'تحويل عبر شبكة المصارف المحلية نفسها.',
    resultingStatus: 'paid',
    requiresCardDetails: false,
  },
  stripe: {
    label: 'Stripe',
    hint: 'بوابة الدفع الدولية.',
    resultingStatus: 'paid',
    requiresCardDetails: false,
  },
}

/** ترتيب العرض: الأشيع أولاً — لا يغيّر قيم العقد */
export const PAYMENT_METHOD_ORDER: readonly PaymentMethod[] = ['cod', 'card', 'tadawul', 'local_bank', 'stripe']

/* ═══ الشحن — سائقو `ShippingManager` ورسومهم ═══ */

export type ShippingProvider = 'local' | 'almadar' | 'aramex'

export interface ShippingProviderMeta {
  label: string
  /** وصف الرسوم كما يحسبها السائق في الباكند */
  feeNote: string
  /** مرآة `calculateFee` — للعرض قبل الإرسال لا غير */
  feeFor: (city: string) => number
}

export const SHIPPING_PROVIDERS: Record<ShippingProvider, ShippingProviderMeta> = {
  local: { label: 'توصيل المتجر المحلي', feeNote: 'رسوم موحّدة لكل المدن', feeFor: () => 10 },
  almadar: {
    label: 'المدار السريع للتوصيل',
    feeNote: 'طرابلس أقل من بقية المدن',
    feeFor: (city) => (city.trim() === 'طرابلس' ? 10 : 15),
  },
  aramex: { label: 'Aramex', feeNote: 'رسوم موحّدة للمناطق البعيدة', feeFor: () => 35 },
}

/** ما يفترضه الخادم حين لا يصل `shipping_provider` — مصدر الرسوم المعروضة اليوم */
export const DEFAULT_SHIPPING_PROVIDER: ShippingProvider = 'local'

/** رسوم الشحن المعروضة — تقدير مطابق لسائق الخادم، والخادم يعيد حسابها عند الإتمام */
export function shippingFeeOf(city: string, provider: ShippingProvider = DEFAULT_SHIPPING_PROVIDER): number {
  return SHIPPING_PROVIDERS[provider].feeFor(city)
}

/** إجمالي الطلب — مطابق لصيغة الخادم: max(0, المنتجات + الشحن − الخصم) */
export function grandTotalOf(subtotal: number, shippingFee: number, discountAmount = 0): number {
  return Math.max(0, subtotal + shippingFee - discountAmount)
}
