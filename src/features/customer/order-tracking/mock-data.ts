import type { OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لتتبع الطلب (2.2.8) — الاستعلام برقم الطلب + رقم الهاتف معاً،
 * دون حساب. حقول يراها الزبون حصراً: لا SKU ولا مخزون ولا رسوم شحن (D1) ولا أسباب إلغاء داخلية.
 * لا تُستورد خارج هذه الميزة.
 */

export interface TrackedOrder {
  id: string
  /** هاتف صاحب الطلب — شرط المطابقة الثاني (2.2.8) */
  phone: string
  storeName: string
  createdAt: string
  status: OrderStatus
  itemCount: number
  /** مجموع المنتجات فقط — الإجمالي النهائي رهن D1/D9 فلا يُعرض */
  productsSubtotal: number
  paymentMethod: string
  payment: PaymentStatus
  pickupLocation: string
  /** أوقات المراحل المكتملة (برومت 15: خط زمني بأوقات) */
  times: Partial<Record<OrderStatus, string>>
}

export const TRACKED_ORDERS: readonly TrackedOrder[] = [
  {
    id: 'TW-2481-9X',
    phone: '+218912345678',
    storeName: 'متجر العافية',
    createdAt: 'اليوم، 10:30 ص',
    status: 'preparing',
    itemCount: 3,
    productsSubtotal: 173,
    paymentMethod: 'بطاقة مصرفية',
    payment: 'paid',
    pickupLocation: 'المنزل',
    times: { confirmed: 'اليوم، 10:30 ص', preparing: 'اليوم، 11:15 ص' },
  },
  {
    id: 'TW-2478-2B',
    phone: '+218917774455',
    storeName: 'متجر العافية',
    createdAt: 'أمس، 2:05 م',
    status: 'delivered',
    itemCount: 2,
    productsSubtotal: 89,
    paymentMethod: 'بطاقة مصرفية',
    payment: 'paid',
    pickupLocation: 'مكتب الشحن',
    times: { confirmed: 'أمس، 2:05 م', preparing: 'أمس، 3:40 م', ready: 'أمس، 6:10 م', delivered: 'اليوم، 9:20 ص' },
  },
  {
    id: 'TW-2475-3W',
    phone: '+218913034455',
    storeName: 'متجر العافية',
    createdAt: '13 أغسطس',
    status: 'cancelled',
    itemCount: 2,
    productsSubtotal: 110,
    paymentMethod: 'كاش عند الاستلام',
    payment: 'cod',
    pickupLocation: 'المنزل',
    times: { confirmed: '13 أغسطس، 5:20 م', cancelled: '13 أغسطس، 8:45 م' },
  },
]

function normalizeId(value: string): string {
  return value.trim().toUpperCase()
}

function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '').replace(/^\+/, '').replace(/^218/, '').replace(/^0/, '')
}

/** المطابقة المحلية: الرقمان معاً (2.2.8) — لا كشف بيانات بأحدهما فقط */
export function findTrackedOrder(id: string, phone: string): TrackedOrder | undefined {
  const wantedId = normalizeId(id)
  const wantedPhone = normalizePhone(phone)
  return TRACKED_ORDERS.find((order) => normalizeId(order.id) === wantedId && normalizePhone(order.phone) === wantedPhone)
}
