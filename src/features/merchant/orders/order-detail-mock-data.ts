import type { PaymentMethod } from '../../../types/checkout'
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «تفاصيل الطلب» — طلب واحد (TW-2481-9X)
 * متسق مع قائمة الطلبات وشاشة تتبع الزبون. الحقول من 1.5.3 وبرومت 7 و2.2.5،
 * ورسوم الشحن ورقم التتبع ورقم المعاملة من `StorefrontOrderResource` في الباكند.
 */

export interface OrderDetailItem {
  id: string
  product: string
  variant?: string
  sku: string
  /** سعر الوحدة بالدينار (رقم للحساب المحلي البسيط: إجمالي السطر = السعر × الكمية) */
  unitPrice: number
  quantity: number
}

export interface OrderDetailData {
  id: string
  createdAt: string
  customer: {
    name: string
    phone: string
  }
  /** مكان الاستلام (2.2.5 / برومت 14: المنزل أو مكتب الشحن) */
  pickupLocation: string
  address: {
    city: string
    details: string
  }
  payment: PaymentStatus
  /** محور مستقل — orders.fulfillment_status */
  fulfillment: FulfillmentStatus
  /** `orders.payment_method` — إحدى طرق العقد الخمس */
  paymentMethod: PaymentMethod
  /** `orders.payment_transaction_id` — يغيب مع الدفع عند الاستلام */
  paymentTransactionId?: string
  /** `orders.tracking_number` — بوليصة شركة التوصيل، فريد على مستوى الجدول */
  trackingNumber: string
  /** `orders.shipping_fee` كما حسبه سائق الشحن في الخادم */
  shippingFee: number
  initialStatus: OrderStatus
  items: OrderDetailItem[]
}

export const ORDER_DETAIL: OrderDetailData = {
  id: 'TW-2481-9X',
  createdAt: 'اليوم، 10:30 ص',
  customer: {
    name: 'فاطمة إدريس',
    phone: '+218 91 234 5678',
  },
  pickupLocation: 'المنزل',
  address: {
    city: 'طرابلس',
    details: 'حي الأندلس، شارع الجمهورية، بجوار صيدلية الشفاء',
  },
  payment: 'paid',
  fulfillment: 'unfulfilled',
  paymentMethod: 'card',
  paymentTransactionId: 'TXN-4K9PZ2XQ7MD1WB3E',
  trackingNumber: 'TRK-LCL-8QF2M4KD9P',
  shippingFee: 10,
  initialStatus: 'processing',
  items: [
    { id: 'l1', product: 'شامبو أرغان 400مل', sku: 'SH-ARG-400', unitPrice: 45, quantity: 1 },
    { id: 'l2', product: 'كريم زبدة الشيا', variant: 'حجم متوسط', sku: 'CR-SHEA-M', unitPrice: 18, quantity: 1 },
    { id: 'l3', product: 'قميص قطني رجالي', variant: 'M / أزرق', sku: 'TS-CTN-M-BL', unitPrice: 55, quantity: 2 },
  ],
}

export function lineTotal(item: OrderDetailItem): number {
  return item.unitPrice * item.quantity
}

export function itemsSubtotal(items: readonly OrderDetailItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}
