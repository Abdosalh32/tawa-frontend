import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { IconButton } from './IconButton'

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'id'> {
  id?: string
  /** التسمية الوصولية (مخفية بصرياً — الـ Placeholder ليس التسمية الوحيدة) */
  label?: string
  value: string
  onChange: (value: string) => void
}

/** حقل بحث فوري بزر مسح — للقوائم والفلاتر */
export function SearchField({ id: idProp, label = 'بحث', value, onChange, placeholder = 'ابحث…', ...rest }: SearchFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId

  return (
    <div className="tw-search">
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <span className="tw-search__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        className="tw-control"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />
      {value !== '' && (
        <IconButton label="مسح البحث" size="sm" className="tw-search__clear" onClick={() => onChange('')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2 2l8 8M10 2L2 10" />
          </svg>
        </IconButton>
      )}
    </div>
  )
}
