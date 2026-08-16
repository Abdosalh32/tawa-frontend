import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cx } from './cx'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id?: string
  label: string
  description?: string
  /** أزرار المجموعة الواحدة تتشارك نفس name */
  name: string
}

export function Radio({ id: idProp, label, description, disabled, ...rest }: RadioProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cx('tw-check', disabled && 'is-disabled')}>
      <input type="radio" id={id} disabled={disabled} aria-describedby={descriptionId} {...rest} />
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
