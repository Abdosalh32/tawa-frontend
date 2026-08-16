import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { Field } from './Field'
import { fieldDescribedBy } from './field-utils'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string
  label: string
  optional?: boolean
  helperText?: string
  error?: string
}

export function Textarea({ id: idProp, label, optional, helperText, error, disabled, rows = 4, ...rest }: TextareaProps) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <Field id={id} label={label} optional={optional} helperText={helperText} error={error} disabled={disabled}>
      <textarea
        id={id}
        className="tw-control"
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, helperText, error)}
        {...rest}
      />
    </Field>
  )
}
