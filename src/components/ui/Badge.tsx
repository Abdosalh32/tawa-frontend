import type { ReactNode } from 'react'
import { cx } from './cx'

/**
 * أدوار الشارة دلالية حصراً — لا تُستخدم حالة لزينة غير مرتبطة:
 * neutral: محايد (كاش عند الاستلام، مؤرشف)
 * success: مكتمل/سليم (مسلّم، منشور، متوفر)
 * warning: يحتاج انتباهاً (قيد التجهيز، مخزون منخفض، بانتظار)
 * progress: تمييز مرحلي متقدم (جاهز للتسليم) — دور danger-mid في الأسس
 * error: حرج (ملغى، نفد، محظور)
 * info: معلوماتي (مؤكد، محجوز)
 */
export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'progress' | 'error' | 'info'

export interface BadgeProps {
  variant?: BadgeVariant
  /** النقطة الملونة جزء من هوية الشارة — تُخفى عند التكرار البصري فقط */
  dot?: boolean
  children: ReactNode
}

export function Badge({ variant = 'neutral', dot = true, children }: BadgeProps) {
  return (
    <span className={cx('tw-badge', `tw-badge--${variant}`)}>
      {dot && <span className="tw-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
