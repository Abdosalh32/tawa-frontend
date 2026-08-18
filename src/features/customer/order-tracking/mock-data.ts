import type { PaymentMethod } from '../../../types/checkout'
import type { OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لتتبع الطلب (2.2.8) — يقابل GET /v1/storefront/{store}/track-order:
 * رقم الهاتف **مع** رقم الطلب أو رقم التتبع (أحدهما يكفي، والعقد يشترط الآخر عند غيابه).
 * الحقول مطابقة لـ StorefrontOrderResource؛ حقول التاجر الداخلية (SKU، مخزون، أسباب إلغاء) لا تُعرض.
 * لا تُستورد خارج هذه الميزة.
 */

/** أي رقم يستعلم به الزبون — يقابل حقلَي العقد `order_number` و`tracking_number` */
export type LookupField = 'order_number' | 'tracking_number'

export const LOOKUP_FIELDS: ReadonlyArray<{ value: LookupField; label: string; hint: string }> = [
  { value: 'order_number', label: 'رقم الطلب', hint: 'مثال: TW-2481-9X' },
  { value: 'tracking_number', label: 'رقم التتبع', hint: 'مثال: TRK-LCL-8QF2M4KD9P' },
]

export interface TrackedOrder {
  /** `order_number` */
  id: string
  /** `tracking_number` — يصدره سائق الشحن عند إنشاء البوليصة */
  trackingNumber: string
  /** هاتف صاحب الطلب — شرط المطابقة الثاني دائماً (2.2.8) */
  phone: string
  storeName: string
  createdAt: string
  status: OrderStatus
  itemCount: number
  /** `subtotal` */
  productsSubtotal: number
  /** `shipping_fee` كما حسبه الخادم عبر سائق الشحن */
  shippingFee: number
  /** `discount_amount` (صفر حين لا كود) */
  discountAmount: number
  /** `discount_code` */
  discountCode?: string
  /** `grand_total` = المنتجات + الشحن − الخصم */
  grandTotal: number
  /** `payment_method` */
  paymentMethod: PaymentMethod
  /** `payment_status` */
  payment: PaymentStatus
  pickupLocation: string
  /** أوقات المراحل المكتملة (برومت 15: خط زمني بأوقات) */
  times: Partial<Record<OrderStatus, string>>
}

export const TRACKED_ORDERS: readonly TrackedOrder[] = [
  {
    id: 'TW-2481-9X',
    trackingNumber: 'TRK-LCL-8QF2M4KD9P',
    phone: '+218912345678',
    storeName: 'متجر العافية',
    createdAt: 'اليوم، 10:30 ص',
    status: 'processing',
    itemCount: 3,
    productsSubtotal: 173,
    shippingFee: 10,
    discountAmount: 0,
    grandTotal: 183,
    paymentMethod: 'card',
    payment: 'paid',
    pickupLocation: 'المنزل',
    times: { pending: 'اليوم، 10:28 ص', confirmed: 'اليوم، 10:30 ص', processing: 'اليوم، 11:15 ص' },
  },
  {
    id: 'TW-2478-2B',
    trackingNumber: 'TRK-LCL-3HD7K2WQ1N',
    phone: '+218917774455',
    storeName: 'متجر العافية',
    createdAt: 'أمس، 2:05 م',
    status: 'delivered',
    itemCount: 2,
    productsSubtotal: 89,
    shippingFee: 10,
    discountAmount: 9,
    discountCode: 'WELCOME10',
    grandTotal: 90,
    paymentMethod: 'tadawul',
    payment: 'paid',
    pickupLocation: 'مكتب الشحن',
    times: { pending: 'أمس، 2:03 م', confirmed: 'أمس، 2:05 م', processing: 'أمس، 3:40 م', ready_for_delivery: 'أمس، 6:10 م', delivered: 'اليوم، 9:20 ص' },
  },
  {
    id: 'TW-2475-3W',
    trackingNumber: 'TRK-LCL-5PB9V6ZR4C',
    phone: '+218913034455',
    storeName: 'متجر العافية',
    createdAt: '13 أغسطس',
    status: 'cancelled',
    itemCount: 2,
    productsSubtotal: 110,
    shippingFee: 10,
    discountAmount: 0,
    grandTotal: 120,
    paymentMethod: 'cod',
    payment: 'unpaid',
    pickupLocation: 'المنزل',
    times: { pending: '13 أغسطس، 5:18 م', confirmed: '13 أغسطس، 5:20 م', cancelled: '13 أغسطس، 8:45 م' },
  },
]

function normalizeId(value: string): string {
  return value.trim().toUpperCase()
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '').replace(/^\+/, '').replace(/^218/, '').replace(/^0/, '')
}

/**
 * المطابقة المحلية: الرقم المختار **مع** الهاتف (2.2.8) — لا كشف بيانات بأحدهما وحده.
 * الحقل المستعلم به صريح كما في العقد، فلا تخمين لصيغة ما أدخله الزبون.
 */
export function findTrackedOrder(field: LookupField, value: string, phone: string): TrackedOrder | undefined {
  const wanted = normalizeId(value)
  const wantedPhone = normalizePhone(phone)
  return TRACKED_ORDERS.find(
    (order) =>
      normalizeId(field === 'order_number' ? order.id : order.trackingNumber) === wanted &&
      normalizePhone(order.phone) === wantedPhone,
  )
}
