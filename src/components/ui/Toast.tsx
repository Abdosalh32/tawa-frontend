import type { ReactNode } from 'react'
import { cx } from './cx'
import { IconButton } from './IconButton'

export type ToastVariant = 'neutral' | 'success' | 'error'

export interface ToastProps {
  variant?: ToastVariant
  message: string
  /** إجراء اختياري («إتمام الشراء» بعد الإضافة للسلة) */
  action?: ReactNode
  onClose?: () => void
  /** true: يطفو أعلى يسار الشاشة (RTL)؛ false: يُعرض في مكانه */
  floating?: boolean
}

/**
 * نسخة عرضية محلية — لا يوجد نظام إشعارات عام بعد
 * (مركز الإشعارات معلّق على قرار D7).
 */
export function Toast({ variant = 'neutral', message, action, onClose, floating = false }: ToastProps) {
  return (
    <div className={cx('tw-toast', `tw-toast--${variant}`, floating && 'tw-toast--floating')} role="status" aria-live="polite">
      <span className="tw-toast__dot" aria-hidden="true" />
      <span>{message}</span>
      {action}
      {onClose && (
        <IconButton label="إغلاق التنبيه" size="sm" onClick={onClose}>
          <CloseGlyph />
        </IconButton>
      )}
    </div>
  )
}

function CloseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  )
}
