import type { BadgeVariant } from '../components/ui/Badge'

/**
 * القواميس الدلالية الموحدة للحالات — تُستهلك في كل الشاشات، ولا يُعرَّف لون حالة محلياً.
 *
 * **المفاتيح مطابقة حرفياً لقيم enum في الباكند** (قرار 17 أغسطس 2026: الباكند هو المرجع)
 * كي يعمل الربط دون طبقة ترجمة. مرجع كل قاموس مذكور فوقه بجدوله في الـ schema.
 * التسميات العربية من المتطلبات ووثائق التصميم.
 */

export interface StatusMeta {
  label: string
  variant: BadgeVariant
}

/**
 * حالات الطلب — `orders.order_status` في الباكند (ست حالات).
 * المتطلبات (1.5.4) تذكر أربعاً؛ الباكند يضيف `pending` قبل التأكيد
 * ويسمّي «قيد التجهيز» بـ `processing`.
 */
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_for_delivery' | 'delivered' | 'cancelled'

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  pending: { label: 'بانتظار التأكيد', variant: 'neutral' },
  confirmed: { label: 'مؤكد', variant: 'info' },
  processing: { label: 'قيد التجهيز', variant: 'warning' },
  ready_for_delivery: { label: 'جاهز للتسليم', variant: 'progress' },
  delivered: { label: 'مسلّم', variant: 'success' },
  cancelled: { label: 'ملغى', variant: 'error' },
}

/** المسار الخطي للأمام (بلا الإلغاء) — يستهلكه Stepper الطلب وخط تتبع الزبون */
export const ORDER_FLOW: ReadonlyArray<Exclude<OrderStatus, 'cancelled'>> = [
  'pending',
  'confirmed',
  'processing',
  'ready_for_delivery',
  'delivered',
]

/**
 * حالة التجهيز — `orders.fulfillment_status` في الباكند.
 * محور مستقل عن حالة الطلب والدفع (يطابق «حالات منفصلة» في 1.5.2).
 */
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled'

export const FULFILLMENT_STATUS: Record<FulfillmentStatus, StatusMeta> = {
  unfulfilled: { label: 'غير مُجهَّز', variant: 'neutral' },
  fulfilled: { label: 'مُجهَّز', variant: 'success' },
}

/** حالات المخزون (1.4.9 – 1.4.12) — مشتقة في الواجهة، لا عمود لها في الباكند */
export type StockStatus = 'available' | 'low' | 'out' | 'reserved'

export const STOCK_STATUS: Record<StockStatus, StatusMeta> = {
  available: { label: 'متوفر', variant: 'success' },
  low: { label: 'مخزون منخفض', variant: 'warning' },
  out: { label: 'نفد المخزون', variant: 'error' },
  reserved: { label: 'محجوز', variant: 'info' },
}

/**
 * حالات الدفع — `orders.payment_status` في الباكند.
 * ملاحظة عقدية: **لا عمود `payment_method` في جدول الطلبات**، فوسيلة الدفع
 * (كاش/بطاقة) لا مكان لها خلفياً بعد — تُعرض كنص معاينة فقط حتى حسم D2.
 */
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  unpaid: { label: 'غير مدفوع', variant: 'neutral' },
  paid: { label: 'مدفوع', variant: 'success' },
  refunded: { label: 'مُسترجع', variant: 'info' },
}

/** حالات المنتج — `products.status` في الباكند (`active` = المنشور للزبائن) */
export type ProductStatus = 'draft' | 'active' | 'archived'

export const PRODUCT_STATUS: Record<ProductStatus, StatusMeta> = {
  draft: { label: 'مسودة', variant: 'neutral' },
  active: { label: 'منشور', variant: 'success' },
  archived: { label: 'مؤرشف', variant: 'neutral' },
}

/**
 * حالة الخصم — مشتقة في الواجهة من `discounts.is_active` وفترة السريان
 * (`starts_at`/`ends_at`)؛ لا عمود حالة مفرد في الباكند.
 */
export type DiscountStatus = 'active' | 'ended'

export const DISCOUNT_STATUS: Record<DiscountStatus, StatusMeta> = {
  active: { label: 'نشط', variant: 'success' },
  ended: { label: 'منتهٍ', variant: 'neutral' },
}

/**
 * حالة المتجر — `stores.status` في الباكند (ثلاث حالات فقط).
 * **لا تعليق ولا حظر على المتجر** خلفياً؛ التعليق على التاجر (انظر `MERCHANT_STATUS`).
 */
export type StoreStatus = 'draft' | 'active' | 'maintenance'

export const STORE_STATUS: Record<StoreStatus, StatusMeta> = {
  draft: { label: 'مسودة — غير منشور', variant: 'neutral' },
  active: { label: 'منشور', variant: 'success' },
  maintenance: { label: 'صيانة مؤقتة', variant: 'warning' },
}

/**
 * حالة حساب التاجر — `merchants.status` في الباكند.
 * هنا يقع التعليق (م.1.3.4)؛ **ولا قيمة `rejected`** فمسار رفض الاعتماد (م.1.3.3)
 * بلا مقابل خلفي حتى بناء نطاق الاعتماد.
 */
export type MerchantStatus = 'pending_verification' | 'active' | 'suspended'

export const MERCHANT_STATUS: Record<MerchantStatus, StatusMeta> = {
  pending_verification: { label: 'بانتظار تفعيل الهاتف', variant: 'warning' },
  active: { label: 'نشط', variant: 'success' },
  suspended: { label: 'معلّق', variant: 'error' },
}

/** حالة عضو الفريق — `store_staff.status` في الباكند */
export type StaffStatus = 'invited' | 'active' | 'suspended'

export const STAFF_STATUS: Record<StaffStatus, StatusMeta> = {
  invited: { label: 'بانتظار قبول الدعوة', variant: 'warning' },
  active: { label: 'نشط', variant: 'success' },
  suspended: { label: 'معطّل', variant: 'neutral' },
}

/**
 * حالة فحص المنتج لدى الإدارة (م.1.3.8 – م.1.3.9).
 * **بلا مقابل خلفي** — لا جدول ولا عمود للفحص؛ يُبنى مع نطاق الإدارة.
 */
export type ModerationStatus = 'pending' | 'ok' | 'violating'

export const MODERATION_STATUS: Record<ModerationStatus, StatusMeta> = {
  pending: { label: 'بانتظار الفحص', variant: 'warning' },
  ok: { label: 'سليم', variant: 'success' },
  violating: { label: 'مخالف', variant: 'error' },
}

/**
 * حالات اعتماد التاجر (م.1.3.1 – م.1.3.5).
 * **بلا مقابل خلفي** — لا جدول طلبات انضمام ولا وثائق؛ يُبنى مع نطاق الإدارة.
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'banned'

export const APPROVAL_STATUS: Record<ApprovalStatus, StatusMeta> = {
  pending: { label: 'بانتظار المراجعة', variant: 'warning' },
  approved: { label: 'معتمد', variant: 'success' },
  rejected: { label: 'مرفوض — مع سبب', variant: 'error' },
  suspended: { label: 'معلّق', variant: 'warning' },
  banned: { label: 'محظور', variant: 'error' },
}
