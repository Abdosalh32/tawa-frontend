import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Field } from './Field'
import { fieldDescribedBy } from './field-utils'

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id?: string
  label: string
  type?: InputType
  optional?: boolean
  helperText?: string
  error?: string
  /**
   * فرض عرض LTR لمحتوى الحقل (أكواد، SKU، نطاقات).
   * الأنواع tel/email/number تُعرض LTR تلقائياً بحسب قواعد §8 في الأسس.
   */
  ltr?: boolean
}

export function Input({ id: idProp, label, type = 'text', optional, helperText, error, ltr, disabled, ...rest }: InputProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const isLtr = ltr || type === 'tel' || type === 'email' || type === 'number'

  return (
    <Field id={id} label={label} optional={optional} helperText={helperText} error={error} disabled={disabled}>
      <input
        id={id}
        type={type}
        className="tw-control"
        dir={isLtr ? 'ltr' : undefined}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, helperText, error)}
        {...rest}
      />
    </Field>
  )
}
