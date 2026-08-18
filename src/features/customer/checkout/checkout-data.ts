import { PAYMENT_METHODS } from '../../../types/checkout'
import type { PaymentMethod } from '../../../types/checkout'

/**
 * بيانات وتحقق شاشة إتمام الشراء — محلية بالكامل، لا طلب فعلياً.
 * الحقول تقابل `StorefrontCheckoutRequest` حقلاً بحقل.
 */

/** المدن (برومت 14: «المدينة منسدلة بمدن ليبية») — تُرسل في `shipping_address.city` */
export const CITIES: readonly string[] = ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'زليتن', 'سبها', 'البيضاء']

/** مكان الاستلام (2.2.5 / برومت 14: المنزل أو مكتب الشحن) — لا حقل له في عقد الباكند بعد */
export type PickupLocation = 'home' | 'office'

export const PICKUP_OPTIONS: ReadonlyArray<{ value: PickupLocation; label: string }> = [
  { value: 'home', label: 'المنزل' },
  { value: 'office', label: 'مكتب الشحن' },
]

export interface CheckoutFormState {
  /** `customer_name` */
  name: string
  /** `customer_phone` */
  phone: string
  /** `shipping_address.city` */
  city: string
  /** `shipping_address.address` */
  address: string
  pickup: PickupLocation
  /** `payment_method` */
  payment: PaymentMethod
  /** `payment_card_details.card_number` — يُرسل مع «بطاقة مصرفية» فقط */
  cardNumber: string
  /** `payment_card_details.cvv` — الخادم يحدّه بأربعة محارف */
  cvv: string
  /** ملاحظات اختيارية (برومت 14) — لا حقل لها في العقد، لا تحجب التأكيد */
  notes: string
}

export function emptyCheckout(): CheckoutFormState {
  return { name: '', phone: '', city: '', address: '', pickup: 'home', payment: 'cod', cardNumber: '', cvv: '', notes: '' }
}

export interface CheckoutErrors {
  name?: string
  phone?: string
  city?: string
  address?: string
  cardNumber?: string
  cvv?: string
}

export function validateCheckout(form: CheckoutFormState): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (form.name.trim() === '') {
    errors.name = 'الاسم مطلوب لاستلام الشحنة'
  }
  const phone = form.phone.replace(/[\s-]/g, '')
  if (!/^\+?\d{9,15}$/.test(phone)) {
    errors.phone = 'أدخل رقم هاتف صالحاً — يُستخدم لتتبع طلبك دون حساب'
  }
  if (form.city === '') {
    errors.city = 'اختر مدينتك'
  }
  if (form.address.trim() === '') {
    errors.address = 'أدخل العنوان التفصيلي'
  }
  /* حقلا البطاقة شرطيان تماماً كما في العقد: مطلوبان مع `card` وحدها.
     الخادم يشترط الوجود ويحدّ الـ CVV بأربعة محارف؛ فحص الصيغة هنا إضافة واجهة تمنع رحلة خاسرة. */
  if (PAYMENT_METHODS[form.payment].requiresCardDetails) {
    const cardNumber = form.cardNumber.replace(/[\s-]/g, '')
    if (!/^\d{12,19}$/.test(cardNumber)) {
      errors.cardNumber = 'أدخل رقم البطاقة كاملاً (١٢–١٩ رقماً)'
    }
    if (!/^\d{3,4}$/.test(form.cvv.trim())) {
      errors.cvv = 'رمز التحقق ٣ أو ٤ أرقام كما هو خلف البطاقة'
    }
  }
  return errors
}

/** رقم الطلب التجريبي (`order_number`) — أحد مدخلَي التتبع */
export const MOCK_ORDER_NUMBER = 'TW-2481-9X'

/** رقم التتبع التجريبي (`tracking_number`) بصيغة سائق التوصيل المحلي في الباكند */
export const MOCK_TRACKING_NUMBER = 'TRK-LCL-8QF2M4KD9P'
