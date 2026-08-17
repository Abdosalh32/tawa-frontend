import type { ApprovalStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لرئيسية لوحة الإدارة (برومت 16) — للعرض فقط،
 * لا تُستورد خارج هذه الميزة. لا مخططات نمو مصطنعة (انظر التقرير).
 */

export interface AdminMetric {
  key: string
  label: string
  value: string
  change?: string
  tone: 'neutral' | 'positive' | 'warning' | 'negative'
}

export const ADMIN_METRICS: readonly AdminMetric[] = [
  { key: 'active-stores', label: 'متاجر نشطة', value: '142', tone: 'positive', change: 'من أصل 146 متجراً مسجلاً' },
  { key: 'pending', label: 'طلبات اعتماد معلّقة', value: '5', tone: 'warning', change: 'أقدمها منذ 3 أيام' },
  { key: 'revenue', label: 'إيرادات الاشتراكات الشهرية', value: '3,225 د.ل', tone: 'neutral', change: 'من 104 اشتراكات مدفوعة' },
  { key: 'restricted', label: 'متاجر معلّقة أو محظورة', value: '4', tone: 'negative', change: 'تحتاج متابعة' },
]

/** «مواقع تحتاج انتباهك» (برومت 16) — بنود بأولوية وزر سريع */
export interface AttentionItem {
  key: string
  label: string
  actionLabel: string
  tone: 'warning' | 'negative' | 'neutral'
}

export const ATTENTION_ITEMS: readonly AttentionItem[] = [
  { key: 'approvals', label: '5 طلبات اعتماد بانتظار المراجعة', actionLabel: 'مراجعة الطلبات', tone: 'warning' },
  { key: 'moderation', label: '12 منتجاً بانتظار الفحص', actionLabel: 'فحص المنتجات', tone: 'warning' },
  { key: 'suspended', label: 'متجران معلّقان بانتظار معالجة', actionLabel: 'عرض المتاجر', tone: 'negative' },
  { key: 'subscriptions', label: '3 اشتراكات تنتهي هذا الأسبوع', actionLabel: 'عرض الباقات', tone: 'neutral' },
]

/** أحدث المتاجر المسجلة بحالاتها (برومت 16) */
export interface RecentStore {
  id: string
  storeName: string
  merchantName: string
  subdomain: string
  registeredAt: string
  status: ApprovalStatus
}

export const RECENT_STORES: readonly RecentStore[] = [
  { id: 's1', storeName: 'مكتبة الأندلس', merchantName: 'جواد بن عيسى', subdomain: 'andalus.tawa.ly', registeredAt: 'اليوم', status: 'pending' },
  { id: 's2', storeName: 'سوق الخير', merchantName: 'سالم القمودي', subdomain: 'alkhair.tawa.ly', registeredAt: 'أمس', status: 'suspended' },
  { id: 's3', storeName: 'متجر العافية', merchantName: 'فاطمة إدريس', subdomain: 'alafya.tawa.ly', registeredAt: '12 أغسطس', status: 'approved' },
  { id: 's4', storeName: 'ركن الهدايا', merchantName: 'مريم الزوي', subdomain: 'hadaya.tawa.ly', registeredAt: '11 أغسطس', status: 'approved' },
  { id: 's5', storeName: 'عطور الشرق', merchantName: 'خالد المقريف', subdomain: 'sharq.tawa.ly', registeredAt: '10 أغسطس', status: 'rejected' },
]

/** أحدث عمليات سجل التدقيق (م.1.3.13) — قراءة فقط */
export interface AuditEntry {
  id: string
  description: string
  time: string
  tone: 'success' | 'critical' | 'warning' | 'info'
}

export const RECENT_AUDIT: readonly AuditEntry[] = [
  { id: 'a1', description: 'اعتمد (جواد) متجر (ركن الهدايا) وفعّله للنشر', time: 'اليوم، 9:40 ص', tone: 'success' },
  { id: 'a2', description: 'حظر (جواد) منتجاً مخالفاً في متجر (سوق الخير)', time: 'أمس، 4:15 م', tone: 'critical' },
  { id: 'a3', description: 'علّق (جواد) متجر (سوق الخير) مؤقتاً', time: 'أمس، 4:20 م', tone: 'warning' },
]
