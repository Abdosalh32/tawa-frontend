import type { ReactNode } from 'react'
import { cx } from './cx'

export interface FieldProps {
  /** معرّف عنصر الإدخال الذي ترتبط به التسمية */
  id: string
  label: string
  /** الحقول مطلوبة افتراضاً — الاختياري يُوسم نصاً */
  optional?: boolean
  helperText?: string
  /** وجود رسالة خطأ يفعّل حالة الخطأ ويحل محل النص المساعد */
  error?: string
  disabled?: boolean
  children: ReactNode
}

/**
 * غلاف الحقل الموحد: تسمية مرئية دائمة + الحقل + نص مساعد أو خطأ.
 * تُبنى فوقه Input وSelect وTextarea.
 */
export function Field({ id, label, optional, helperText, error, disabled, children }: FieldProps) {
  return (
    <div className={cx('tw-field', error && 'has-error', disabled && 'is-disabled')}>
      <label className="tw-field__label" htmlFor={id}>
        {label}
        {optional && <span className="tw-field__optional">(اختياري)</span>}
      </label>
      {children}
      {error ? (
        <p className="tw-field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="tw-field__helper" id={`${id}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
