import { useId, useRef } from 'react'
import type { ClipboardEvent } from 'react'
import { cx } from './cx'

export interface OtpInputProps {
  /** طول الرمز — 6 خانات للتفعيل الموثق (برومت 1) */
  length?: number
  /** الأرقام المدخلة كسلسلة متصلة */
  value: string
  onChange: (value: string) => void
  label: string
  helperText?: string
  error?: string
}

/**
 * إدخال رمز OTP بخانات تتنقل تلقائياً وتقبل لصق الرمز دفعة واحدة
 * (جرد المكونات §2). الخانات LTR دائماً، ولكل خانة تسمية موضعية للقارئات.
 */
export function OtpInput({ length = 6, value, onChange, label, helperText, error }: OtpInputProps) {
  const groupId = useId()
  const boxRefs = useRef<Array<HTMLInputElement | null>>([])

  const describedBy = error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined

  const focusBox = (index: number) => {
    boxRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  const handleBoxChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (digit === '' && raw !== '') return
    const chars = value.split('')
    chars[index] = digit
    const next = chars.join('').slice(0, length)
    onChange(next)
    if (digit !== '') focusBox(index + 1)
  }

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (digits === '') return
    event.preventDefault()
    onChange(digits)
    focusBox(digits.length)
  }

  return (
    <div className={cx('tw-field', error && 'has-error')}>
      <p className="tw-field__label" id={`${groupId}-label`}>
        {label}
      </p>
      <div
        className="tw-otp"
        role="group"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={describedBy}
        dir="ltr"
        onPaste={handlePaste}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              boxRefs.current[index] = element
            }}
            className="tw-control tw-otp__box"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={value[index] ?? ''}
            aria-label={`الرقم ${index + 1} من ${length}`}
            aria-invalid={error ? true : undefined}
            onChange={(event) => handleBoxChange(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && (value[index] ?? '') === '' && index > 0) {
                event.preventDefault()
                onChange(value.slice(0, index - 1))
                focusBox(index - 1)
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                focusBox(index - 1)
              } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                focusBox(index + 1)
              }
            }}
          />
        ))}
      </div>
      {error ? (
        <p className="tw-field__error" id={`${groupId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="tw-field__helper" id={`${groupId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
