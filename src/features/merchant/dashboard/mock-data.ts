import type { SummaryTone } from '../../../components/ui'
import type { OrderStatus, PaymentStatus, StockStatus } from '../../../types/status'

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

export interface StockAlertItem {
  id: string
  product: string
  variant?: string
  remaining: number
  status: Extract<StockStatus, 'low' | 'out'>
}

export const DASHBOARD_METRICS: readonly DashboardMetric[] = [
  { key: 'new-orders', label: 'الطلبات الجديدة', value: '8', tone: 'neutral', change: 'بانتظار التأكيد' },
  { key: 'in-progress', label: 'طلبات قيد التنفيذ', value: '5', tone: 'neutral', change: 'بين التجهيز والتسليم' },
  { key: 'low-stock', label: 'منتجات منخفضة المخزون', value: '3', tone: 'warning', change: 'تحتاج تعديل كميات' },
  { key: 'published', label: 'المنتجات المنشورة', value: '42', tone: 'positive', change: 'من أصل 45 منتجاً' },
]

export const RECENT_ORDERS: readonly RecentOrder[] = [
  { id: 'TW-2481-9X', customer: 'فاطمة إدريس', date: 'اليوم، 10:30 ص', total: '173 د.ل', payment: 'paid', status: 'preparing' },
  { id: 'TW-2480-4K', customer: 'محمد الشريف', date: 'اليوم، 9:12 ص', total: '45 د.ل', payment: 'cod', status: 'confirmed' },
  { id: 'TW-2479-7M', customer: 'سالم بن عامر', date: 'أمس، 6:40 م', total: '260 د.ل', payment: 'cod', status: 'ready' },
  { id: 'TW-2478-2B', customer: 'آمنة الفيتوري', date: 'أمس، 2:05 م', total: '89 د.ل', payment: 'paid', status: 'delivered' },
  { id: 'TW-2477-5T', customer: 'خالد المقريف', date: '14 أغسطس', total: '132 د.ل', payment: 'cod', status: 'delivered' },
]

export const STOCK_ALERTS: readonly StockAlertItem[] = [
  { id: 'sh-arg-400', product: 'شامبو أرغان 400مل', remaining: 3, status: 'low' },
  { id: 'cr-shea-m', product: 'كريم زبدة الشيا', variant: 'حجم متوسط', remaining: 2, status: 'low' },
  { id: 'pf-oud-50', product: 'عطر العود الملكي 50مل', variant: 'تركيز مضاعف', remaining: 0, status: 'out' },
]
