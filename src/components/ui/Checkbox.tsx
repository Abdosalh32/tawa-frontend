import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from './cx'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id?: string
  label: string
  description?: string
}

export function Checkbox({ id: idProp, label, description, disabled, ...rest }: CheckboxProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cx('tw-check', disabled && 'is-disabled')}>
      <input type="checkbox" id={id} disabled={disabled} aria-describedby={descriptionId} {...rest} />
      <div>
        <label className="tw-check__label" htmlFor={id}>
          {label}
        </label>
        {description && (
          <p className="tw-check__description" id={descriptionId}>
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
