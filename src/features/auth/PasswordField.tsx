import { useId, useState } from 'react'
import { Field, IconButton, fieldDescribedBy } from '../../components/ui'
import { STRENGTH_LABEL, passwordStrength } from './auth-validation'

function EyeGlyph({ off }: { off: boolean }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 8s2.2-3.8 6-3.8S14 8 14 8s-2.2 3.8-6 3.8S2 8 2 8z" />
      <circle cx="8" cy="8" r="1.8" />
      <path d="M3 13L13 3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 8s2.2-3.8 6-3.8S14 8 14 8s-2.2 3.8-6 3.8S2 8 2 8z" />
      <circle cx="8" cy="8" r="1.8" />
    </svg>
  )
}

/** حقل كلمة مرور بزر إظهار/إخفاء — مركّب فوق Field المشترك دون تكرار سلوك */
export function PasswordInput({
  label,
  value,
  onChange,
  helperText,
  error,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  error?: string
  autoComplete?: string
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <Field id={id} label={label} helperText={helperText} error={error}>
      <span className="auth-password">
        <input
          id={id}
          className="tw-control auth-password__input"
          type={visible ? 'text' : 'password'}
          dir="ltr"
          value={value}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, helperText, error)}
          onChange={(event) => onChange(event.target.value)}
        />
        <IconButton
          label={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          size="sm"
          className="auth-password__toggle"
          onClick={() => setVisible((current) => !current)}
        >
          <EyeGlyph off={visible} />
        </IconButton>
      </span>
    </Field>
  )
}

/** مؤشر قوة كلمة المرور (برومت 1) — نص + أشرطة، اللون ليس حامل المعنى الوحيد */
export function StrengthMeter({ password }: { password: string }) {
  if (password === '') return null
  const strength = passwordStrength(password)
  return (
    <div className={`auth-strength auth-strength--${strength}`}>
      <div className="auth-strength__bars" aria-hidden="true">
        <span className="auth-strength__bar" />
        <span className="auth-strength__bar" />
        <span className="auth-strength__bar" />
      </div>
      <p className="auth-strength__label">قوة كلمة المرور: {STRENGTH_LABEL[strength]}</p>
    </div>
  )
}
