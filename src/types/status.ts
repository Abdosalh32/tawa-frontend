import type { BadgeVariant } from '../components/ui/Badge'

/**
 * القواميس الدلالية الموحدة للحالات (المصدر: component-inventory.md §8).
 * تُستهلك في كل الشاشات — لا يُعرَّف لون حالة محلياً.
 */

export interface StatusMeta {
  label: string
  variant: BadgeVariant
}

/** حالات الطلب (1.5.4) — موحدة بين لوحة التاجر وتتبع الزبون */
export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  confirmed: { label: 'مؤكد', variant: 'info' },
  preparing: { label: 'قيد التجهيز', variant: 'warning' },
  ready: { label: 'جاهز للتسليم', variant: 'progress' },
  delivered: { label: 'مسلّم', variant: 'success' },
  cancelled: { label: 'ملغى', variant: 'error' },
}

/** حالات المخزون (1.4.9 – 1.4.12) */
export type StockStatus = 'available' | 'low' | 'out' | 'reserved'

export const STOCK_STATUS: Record<StockStatus, StatusMeta> = {
  available: { label: 'متوفر', variant: 'success' },
  low: { label: 'مخزون منخفض', variant: 'warning' },
  out: { label: 'نفد المخزون', variant: 'error' },
  reserved: { label: 'محجوز', variant: 'info' },
}

/**
 * حالات الدفع — الظاهر منها في المتطلبات فقط.
 * حالات الفشل/الاسترجاع: Pending product decision (D2/G7).
 */
export type PaymentStatus = 'cod' | 'paid'

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  cod: { label: 'كاش عند الاستلام', variant: 'neutral' },
  paid: { label: 'مدفوع', variant: 'success' },
}

/** حالات المنتج (1.4.5، برومت 4: منشور/مسودة/مؤرشف) — «محظور» إداريةٌ تُضاف مع شاشات المدير */
export type ProductStatus = 'published' | 'draft' | 'archived'

export const PRODUCT_STATUS: Record<ProductStatus, StatusMeta> = {
  published: { label: 'منشور', variant: 'success' },
  draft: { label: 'مسودة', variant: 'neutral' },
  archived: { label: 'مؤرشف', variant: 'neutral' },
}

/** حالتا الخصم الموثقتان (برومت 8: نشطة/منتهية) — «مجدول» وغيرها غير منصوصة */
export type DiscountStatus = 'active' | 'ended'

export const DISCOUNT_STATUS: Record<DiscountStatus, StatusMeta> = {
  active: { label: 'نشط', variant: 'success' },
  ended: { label: 'منتهٍ', variant: 'neutral' },
}

/** حالات الاعتماد والرقابة (م.1.3.1 – م.1.3.5) */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'banned'

export const APPROVAL_STATUS: Record<ApprovalStatus, StatusMeta> = {
  pending: { label: 'بانتظار المراجعة', variant: 'warning' },
  approved: { label: 'معتمد', variant: 'success' },
  rejected: { label: 'مرفوض — مع سبب', variant: 'error' },
  suspended: { label: 'معلّق', variant: 'warning' },
  banned: { label: 'محظور', variant: 'error' },
}
