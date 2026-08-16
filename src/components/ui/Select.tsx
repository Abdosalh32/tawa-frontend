import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { Field } from './Field'
import { fieldDescribedBy } from './field-utils'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string
  label: string
  optional?: boolean
  helperText?: string
  error?: string
}

/** قائمة اختيار أصلية — الخيارات تُمرر كـ <option> أبناء */
export function Select({ id: idProp, label, optional, helperText, error, disabled, children, ...rest }: SelectProps) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <Field id={id} label={label} optional={optional} helperText={helperText} error={error} disabled={disabled}>
      <span className="tw-select-wrap">
        <select
          id={id}
          className="tw-control"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, helperText, error)}
          {...rest}
        >
          {children}
        </select>
      </span>
    </Field>
  )
}
