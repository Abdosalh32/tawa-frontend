/**
 * بيانات وتحقق شاشة إتمام الشراء — محلية بالكامل، لا طلب فعلياً.
 * الحقول من 2.2.5 وبرومت 14 حصراً.
 */

/** المدن (برومت 14: «المدينة منسدلة بمدن ليبية») — قائمة تجريبية للعرض */
export const CITIES: readonly string[] = ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'زليتن', 'سبها', 'البيضاء']

/** مكان الاستلام (2.2.5 / برومت 14: المنزل أو مكتب الشحن) */
export type PickupLocation = 'home' | 'office'

export const PICKUP_OPTIONS: ReadonlyArray<{ value: PickupLocation; label: string }> = [
  { value: 'home', label: 'المنزل' },
  { value: 'office', label: 'مكتب الشحن' },
]

/** طرق الدفع الموثقة (2.2.7) — البطاقة معلّقة على D2 */
export type PaymentMethod = 'cod' | 'card'

export interface CheckoutFormState {
  name: string
  phone: string
  city: string
  address: string
  pickup: PickupLocation
  payment: PaymentMethod
  /** ملاحظات اختيارية (برومت 14) — لا تحقق ولا حدود، ولا تحجب التأكيد */
  notes: string
}

export function emptyCheckout(): CheckoutFormState {
  return { name: '', phone: '', city: '', address: '', pickup: 'home', payment: 'cod', notes: '' }
}

export interface CheckoutErrors {
  name?: string
  phone?: string
  city?: string
  address?: string
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
  return errors
}

/** رقم التتبع التجريبي الموثق لشاشة النجاح (برومت 14) — لا توليد أرقام فعلياً */
export const MOCK_TRACKING_ID = 'TW-2481-9X'
