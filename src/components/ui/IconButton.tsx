import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from './cx'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  ref?: Ref<HTMLButtonElement>
  /** التسمية الوصولية إلزامية — تظهر للقارئات وكـ Tooltip نظام */
  label: string
  /** الأيقونة (زخرفية — التسمية هي حاملة المعنى) */
  children: ReactNode
  variant?: 'ghost' | 'danger'
  size?: 'md' | 'sm'
}

export function IconButton({ label, children, variant = 'ghost', size = 'md', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx('tw-iconbtn', variant === 'danger' && 'tw-iconbtn--danger', size === 'sm' && 'tw-iconbtn--sm', className)}
      aria-label={label}
      title={label}
      {...rest}
    >
      <span aria-hidden="true" style={{ display: 'inline-flex' }}>
        {children}
      </span>
    </button>
  )
}
