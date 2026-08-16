import type { ReactNode } from 'react'
import { cx } from './cx'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertProps {
  variant?: AlertVariant
  title: string
  children?: ReactNode
  /** إجراء اختياري (زر إعادة محاولة، رابط تصحيح…) */
  action?: ReactNode
}

/** تنبيه ضمن الصفحة للسياق الموضعي — الأخطاء تُعلن للقارئات فوراً */
export function Alert({ variant = 'info', title, children, action }: AlertProps) {
  return (
    <div className={cx('tw-alert', `tw-alert--${variant}`)} role={variant === 'error' ? 'alert' : 'status'}>
      <p className="tw-alert__title">{title}</p>
      {children && <div className="tw-alert__body">{children}</div>}
      {action && <div className="tw-alert__action">{action}</div>}
    </div>
  )
}
