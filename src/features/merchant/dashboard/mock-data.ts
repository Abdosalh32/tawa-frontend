import type { SummaryTone } from '../../../components/ui'
import type { OrderStatus, PaymentStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «نظرة عامة» — للعرض الثابت فقط.
 * لا تمثل بيانات فعلية ولا حسابات تحليلية، ولا تُستورد خارج هذه الميزة.
 */

export interface DashboardMetric {
  key: string
  label: string
  value: string
  tone: SummaryTone
  change?: string
}

export interface RecentOrder {
  id: string
  customer: string
  date: string
  total: string
  payment: PaymentStatus
  status: OrderStatus
}

/** بند «يحتاج انتباهك» — ماذا/لماذا/ماذا أفعل (الاتجاه الفني §9) */
export interface AttentionEntry {
  id: string
  severity: 'critical' | 'warning'
  title: string
  why: string
  actionLabel: string
  /** وجهة الفعل داخل صدفة المتجر */
  to: 'inventory' | 'orders'
}

export const DASHBOARD_METRICS: readonly DashboardMetric[] = [
  { key: 'new-orders', label: 'الطلبات الجديدة', value: '8', tone: 'neutral', change: 'بانتظار التأكيد' },
  { key: 'in-progress', label: 'طلبات قيد التنفيذ', value: '5', tone: 'neutral', change: 'بين التجهيز والتسليم' },
  { key: 'low-stock', label: 'منتجات منخفضة المخزون', value: '3', tone: 'warning', change: 'تحتاج تعديل كميات' },
  { key: 'published', label: 'المنتجات المنشورة', value: '42', tone: 'positive', change: 'من أصل 45 منتجاً' },
]

export const RECENT_ORDERS: readonly RecentOrder[] = [
  { id: 'TW-2481-9X', customer: 'فاطمة إدريس', date: 'اليوم، 10:30 ص', total: '173 د.ل', payment: 'paid', status: 'processing' },
  { id: 'TW-2480-4K', customer: 'محمد الشريف', date: 'اليوم، 9:12 ص', total: '45 د.ل', payment: 'unpaid', status: 'confirmed' },
  { id: 'TW-2479-7M', customer: 'سالم بن عامر', date: 'أمس، 6:40 م', total: '260 د.ل', payment: 'unpaid', status: 'ready_for_delivery' },
  { id: 'TW-2478-2B', customer: 'آمنة الفيتوري', date: 'أمس، 2:05 م', total: '89 د.ل', payment: 'paid', status: 'delivered' },
  { id: 'TW-2477-5T', customer: 'خالد المقريف', date: '14 أغسطس', total: '132 د.ل', payment: 'unpaid', status: 'delivered' },
]

/* مشتقة من الحقائق التجريبية نفسها (المخزون والطلبات أعلاه) — بترتيب الخطورة */
export const ATTENTION_ITEMS: readonly AttentionEntry[] = [
  {
    id: 'att-out',
    severity: 'critical',
    title: 'نفد مخزون «عطر العود الملكي 50مل — تركيز مضاعف»',
    why: 'المنتج لا يظهر للشراء حتى تُحدَّث كميته',
    actionLabel: 'تحديث المخزون',
    to: 'inventory',
  },
  {
    id: 'att-new-orders',
    severity: 'warning',
    title: '8 طلبات جديدة بانتظار التأكيد',
    why: 'أقدمها منذ الصباح — زبائنك ينتظرون قبول طلباتهم',
    actionLabel: 'مراجعة الطلبات',
    to: 'orders',
  },
  {
    id: 'att-low',
    severity: 'warning',
    title: 'مخزون منخفض في منتجين: «شامبو أرغان 400مل» (3) و«كريم زبدة الشيا» (2)',
    why: 'تحت حد التنبيه — قد ينفدان مع طلبات اليوم',
    actionLabel: 'تعديل الكميات',
    to: 'inventory',
  },
]
