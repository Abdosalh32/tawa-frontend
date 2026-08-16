import type { OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «تفاصيل الطلب» — طلب واحد (TW-2481-9X)
 * متسق مع قائمة الطلبات. الحقول من 1.5.3 وبرومت 7 و2.2.5 حصراً.
 * لا رسوم شحن هنا إطلاقاً — قرار الاحتساب معلّق (D1).
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
  /** وسيلة الدفع الموثقة (2.2.7): كاش عند الاستلام أو بطاقة مصرفية */
  paymentMethod: string
  initialStatus: OrderStatus
  items: OrderDetailItem[]
}

/** مسار الحالة الخطي الوحيد الموثق (1.5.4) — لا قفزات */
export const ORDER_FLOW: ReadonlyArray<Exclude<OrderStatus, 'cancelled'>> = ['confirmed', 'preparing', 'ready', 'delivered']

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
  paymentMethod: 'بطاقة مصرفية',
  initialStatus: 'preparing',
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
