/**
 * بيانات تجريبية محلية لسجل التدقيق (م.1.3.13) — قراءة فقط، لا تحرير إطلاقاً.
 * أنواع العمليات من المتطلبات فقط (اعتماد/رفض/تعليق/فك تعليق/حظر منتج/تعديل باقة/تجديد).
 * «دخول إداري» غير مذكور في المتطلبات فأُغفل، وفلتر المنفّذ مؤجل (تعدد المديرين M8 غير محسوم).
 */

export type AuditOperation =
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'unsuspend'
  | 'ban-product'
  | 'edit-plan'
  | 'renew'

export const OPERATION_META: Record<AuditOperation, { label: string; tone: 'success' | 'critical' | 'warning' | 'info' | 'accent' }> = {
  approve: { label: 'اعتماد تاجر', tone: 'success' },
  reject: { label: 'رفض طلب', tone: 'critical' },
  suspend: { label: 'تعليق متجر', tone: 'warning' },
  unsuspend: { label: 'فك تعليق', tone: 'success' },
  'ban-product': { label: 'حظر منتج', tone: 'critical' },
  'edit-plan': { label: 'تعديل باقة', tone: 'accent' },
  renew: { label: 'تجديد اشتراك', tone: 'info' },
}

export interface AuditRecord {
  id: string
  operation: AuditOperation
  /** وصف واضح الصياغة (برومت 21) */
  description: string
  /** تجميع القائمة: اليوم / أمس / تاريخ */
  dayGroup: string
  time: string
  executedBy: string
  /** تفاصيل السطر الموسّع */
  details: {
    /** القيمة قبل/بعد للعمليات التي تغيّر حالة */
    before?: string
    after?: string
    /** السبب المكتوب عند القرارات المسبَّبة (م.1.3.3، م.1.3.9) */
    reason?: string
    ipAddress: string
  }
  /** هل العملية حرجة (حظر/إزالة) — تُوسم بصرياً أثقل */
  critical?: boolean
}

export const AUDIT_RECORDS: readonly AuditRecord[] = [
  {
    id: 'AUD-4821',
    operation: 'approve',
    description: 'اعتمد (جواد) متجر (ركن الهدايا) وفعّله للنشر',
    dayGroup: 'اليوم',
    time: '09:40',
    executedBy: 'جواد',
    details: { before: 'بانتظار المراجعة', after: 'معتمد', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4820',
    operation: 'ban-product',
    description: 'حظر (جواد) منتج (ساعة يد فاخرة — تقليد) في متجر (سوق الخير) وأزاله',
    dayGroup: 'اليوم',
    time: '09:05',
    executedBy: 'جواد',
    critical: true,
    details: { before: 'منشور', after: 'محظور ومُزال', reason: 'علامة تجارية مقلّدة بصور المنتج', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4819',
    operation: 'renew',
    description: 'جدّد (جواد) اشتراك (فاطمة إدريس) على باقة (احترافية) لمدة شهر',
    dayGroup: 'اليوم',
    time: '08:20',
    executedBy: 'جواد',
    details: { before: 'ينتهي 16 أغسطس', after: 'ينتهي 16 سبتمبر', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4818',
    operation: 'suspend',
    description: 'علّق (جواد) متجر (سوق الخير) مؤقتاً',
    dayGroup: 'أمس',
    time: '16:20',
    executedBy: 'جواد',
    critical: true,
    details: { before: 'نشط', after: 'معلّق', reason: 'وثائق منتهية الصلاحية', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4817',
    operation: 'reject',
    description: 'رفض (جواد) طلب انضمام (خالد المقريف)',
    dayGroup: 'أمس',
    time: '14:55',
    executedBy: 'جواد',
    details: {
      before: 'بانتظار المراجعة',
      after: 'مرفوض',
      reason: 'وثائق التوثيق غير مكتملة — أرفق السجل التجاري كاملاً وأعد التقديم.',
      ipAddress: '41.208.72.14',
    },
  },
  {
    id: 'AUD-4816',
    operation: 'edit-plan',
    description: 'عدّل (جواد) حدود باقة (أساسية): المنتجات من 80 إلى 100',
    dayGroup: 'أمس',
    time: '11:30',
    executedBy: 'جواد',
    details: { before: '80 منتجاً', after: '100 منتج', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4815',
    operation: 'unsuspend',
    description: 'فكّ (جواد) تعليق متجر (مكتبة الأندلس) وأعاده للعمل',
    dayGroup: '15 أغسطس',
    time: '10:10',
    executedBy: 'جواد',
    details: { before: 'معلّق', after: 'نشط', reason: 'عُدّلت الوثائق وتمت المراجعة', ipAddress: '41.208.72.14' },
  },
  {
    id: 'AUD-4814',
    operation: 'ban-product',
    description: 'حظر (جواد) منتج (مكمّل غذائي غير مرخّص) في متجر (إلكترونيات المدينة) وأزاله',
    dayGroup: '15 أغسطس',
    time: '09:25',
    executedBy: 'جواد',
    critical: true,
    details: { before: 'منشور', after: 'محظور ومُزال', reason: 'المنتج يحتاج ترخيصاً صحياً غير مرفق.', ipAddress: '41.208.72.14' },
  },
]
