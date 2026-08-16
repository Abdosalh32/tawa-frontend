import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  /** أساسي واحد لكل شاشة؛ danger للأفعال المدمرة فقط */
  variant?: ButtonVariant
  /** sm للجداول والمساحات الضيقة */
  size?: ButtonSize
  /** يجمّد الزر ويعرض Spinner دون تغيير عرضه */
  loading?: boolean
  /** أيقونة زخرفية قبل النص (النص هو حامل المعنى) */
  icon?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('tw-btn', `tw-btn--${variant}`, size === 'sm' && 'tw-btn--sm', loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="tw-spinner" aria-hidden="true" />}
      {icon && (
        <span className="tw-btn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="tw-btn__label">{children}</span>
    </button>
  )
}
