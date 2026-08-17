import type { FulfillmentStatus, OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «الطلبات» — للعرض والتصفية المحلية فقط،
 * لا تُستورد خارج هذه الميزة. الحقول من برومت 7 والمتطلبات (1.5.2 – 1.5.4)،
 * ومتسقة مع أرقام الطلبات في الشاشات السابقة.
 */

export interface MerchantOrder {
  /** رقم التتبع الفريد (2.2.6) — لاتيني LTR */
  id: string
  customer: string
  /** هاتف الزبون (برومت 7: الزبون + هاتفه) — LTR */
  phone: string
  /** نص تاريخ جاهز الصياغة بأرقام غربية */
  date: string
  /** عدد عناصر الطلب (برومت 7) */
  itemCount: number
  total: string
  payment: PaymentStatus
  status: OrderStatus
  /** محور مستقل — orders.fulfillment_status */
  fulfillment: FulfillmentStatus
}

export const MERCHANT_ORDERS: readonly MerchantOrder[] = [
  { id: 'TW-2482-3P', customer: 'ليلى بن سعيد', phone: '+218 92 818 4433', date: 'اليوم، 11:05 ص', itemCount: 2, total: '64 د.ل', payment: 'unpaid', status: 'pending', fulfillment: 'unfulfilled' },
  { id: 'TW-2481-9X', customer: 'فاطمة إدريس', phone: '+218 91 234 5678', date: 'اليوم، 10:30 ص', itemCount: 3, total: '173 د.ل', payment: 'paid', status: 'processing', fulfillment: 'unfulfilled' },
  { id: 'TW-2480-4K', customer: 'محمد الشريف', phone: '+218 92 111 2233', date: 'اليوم، 9:12 ص', itemCount: 1, total: '45 د.ل', payment: 'unpaid', status: 'confirmed', fulfillment: 'unfulfilled' },
  { id: 'TW-2479-7M', customer: 'سالم بن عامر', phone: '+218 94 555 8899', date: 'أمس، 6:40 م', itemCount: 5, total: '260 د.ل', payment: 'unpaid', status: 'ready_for_delivery', fulfillment: 'fulfilled' },
  { id: 'TW-2478-2B', customer: 'آمنة الفيتوري', phone: '+218 91 777 4455', date: 'أمس، 2:05 م', itemCount: 2, total: '89 د.ل', payment: 'paid', status: 'delivered', fulfillment: 'fulfilled' },
  { id: 'TW-2477-5T', customer: 'خالد المقريف', phone: '+218 94 222 7788', date: '14 أغسطس', itemCount: 4, total: '132 د.ل', payment: 'unpaid', status: 'delivered', fulfillment: 'fulfilled' },
  { id: 'TW-2476-8R', customer: 'مريم الزوي', phone: '+218 92 909 1122', date: '14 أغسطس', itemCount: 1, total: '35 د.ل', payment: 'unpaid', status: 'confirmed', fulfillment: 'unfulfilled' },
  { id: 'TW-2475-3W', customer: 'عبدالله قدور', phone: '+218 91 303 4455', date: '13 أغسطس', itemCount: 2, total: '110 د.ل', payment: 'refunded', status: 'cancelled', fulfillment: 'unfulfilled' },
  { id: 'TW-2474-6Q', customer: 'هدى بالخير', phone: '+218 94 606 3311', date: '13 أغسطس', itemCount: 3, total: '95 د.ل', payment: 'unpaid', status: 'delivered', fulfillment: 'fulfilled' },
  { id: 'TW-2473-1Z', customer: 'أحمد الترهوني', phone: '+218 92 505 6677', date: '12 أغسطس', itemCount: 2, total: '78 د.ل', payment: 'paid', status: 'processing', fulfillment: 'unfulfilled' },
  { id: 'TW-2472-4N', customer: 'زينب العبيدي', phone: '+218 91 808 9900', date: '12 أغسطس', itemCount: 6, total: '310 د.ل', payment: 'unpaid', status: 'delivered', fulfillment: 'fulfilled' },
  { id: 'TW-2471-7C', customer: 'يوسف الككلي', phone: '+218 94 404 5566', date: '11 أغسطس', itemCount: 1, total: '52 د.ل', payment: 'unpaid', status: 'cancelled', fulfillment: 'unfulfilled' },
  { id: 'TW-2470-2H', customer: 'نور الهوني', phone: '+218 92 707 8899', date: '10 أغسطس', itemCount: 2, total: '140 د.ل', payment: 'paid', status: 'delivered', fulfillment: 'fulfilled' },
]
