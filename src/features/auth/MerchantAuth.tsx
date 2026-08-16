import { useEffect, useId, useRef, useState } from 'react'
import { Alert, Button, Checkbox, Field, IconButton, Input, Radio, Toast, fieldDescribedBy } from '../../components/ui'
import { AuthLayout } from './AuthLayout'
import {
  STRENGTH_LABEL,
  passwordStrength,
  validateLogin,
  validateRegistration,
} from './auth-validation'
import type { LoginErrors, LoginFormState, RegistrationErrors, RegistrationFormState } from './auth-validation'

type AuthMode = 'login' | 'register'

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
function PasswordInput({
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
function StrengthMeter({ password }: { password: string }) {
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

const EMPTY_LOGIN: LoginFormState = { identifier: '', password: '', remember: false }
const EMPTY_REGISTRATION: RegistrationFormState = { name: '', email: '', phone: '', password: '', termsAccepted: false }

export function MerchantAuth() {
  /* الافتراضي: تسجيل الدخول */
  const [mode, setMode] = useState<AuthMode>('login')
  const [login, setLogin] = useState<LoginFormState>(EMPTY_LOGIN)
  const [registration, setRegistration] = useState<RegistrationFormState>(EMPTY_REGISTRATION)
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({})
  const [registrationErrors, setRegistrationErrors] = useState<RegistrationErrors>({})
  const [registered, setRegistered] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const focusSummary = () => requestAnimationFrame(() => summaryRef.current?.focus())

  const submitLogin = () => {
    const errors = validateLogin(login)
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusSummary()
      return
    }
    setToast('تم التحقق من البيانات محلياً — تسجيل الدخول الفعلي يتصل مع الربط الخلفي')
  }

  const submitRegistration = () => {
    const errors = validateRegistration(registration)
    setRegistrationErrors(errors)
    if (Object.keys(errors).length > 0) {
      focusSummary()
      return
    }
    setRegistered(true)
    setToast('تم إنشاء الحساب (معاينة محلية — لا حساب فعلياً)')
  }

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setLoginErrors({})
    setRegistrationErrors({})
    setRegistered(false)
  }

  const activeErrors: string[] =
    mode === 'login' ? Object.values(loginErrors) : Object.values(registrationErrors)

  const devControls = (
    <fieldset className="dev-fieldset">
      <legend>أداة معاينة تطويرية — لا مصادقة فعلية ولا حسابات حقيقية</legend>
      <div className="dev-fieldset__options">
        <Radio name="auth-mode" label="تسجيل الدخول (الافتراضي)" checked={mode === 'login'} onChange={() => switchMode('login')} />
        <Radio name="auth-mode" label="إنشاء حساب" checked={mode === 'register'} onChange={() => switchMode('register')} />
        <Button variant="secondary" size="sm" onClick={mode === 'login' ? submitLogin : submitRegistration}>
          إظهار أخطاء التحقق
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setToast('معاينة النجاح المحلي — لا سلوك فعلياً')}>
          إظهار النجاح المحلي
        </Button>
      </div>
    </fieldset>
  )

  return (
    <AuthLayout dev={devControls}>
      {activeErrors.length > 0 && (
        <div ref={summaryRef} tabIndex={-1}>
          <Alert variant="error" title="راجع الحقول التالية">
            <ul style={{ margin: 0, paddingInlineStart: 'var(--space-lg)', display: 'grid', gap: 'var(--space-xs)' }}>
              {activeErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      {mode === 'login' ? (
        <form
          className="auth-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submitLogin()
          }}
        >
          <h1 style={{ fontSize: 'var(--type-h2)' }}>تسجيل دخول التاجر</h1>
          <Input
            label="البريد الإلكتروني أو رقم الهاتف"
            ltr
            autoComplete="username"
            value={login.identifier}
            error={loginErrors.identifier}
            onChange={(event) => setLogin((prev) => ({ ...prev, identifier: event.target.value }))}
          />
          <PasswordInput
            label="كلمة المرور"
            autoComplete="current-password"
            value={login.password}
            error={loginErrors.password}
            onChange={(value) => setLogin((prev) => ({ ...prev, password: value }))}
          />
          <div className="auth-row">
            <Checkbox
              label="تذكرني"
              checked={login.remember}
              onChange={(event) => setLogin((prev) => ({ ...prev, remember: event.target.checked }))}
            />
            {/* الاستعادة موثقة (1.1.4) — شاشاتها تُبنى في مرحلة لاحقة */}
            <Button variant="ghost" size="sm">
              نسيت كلمة المرور؟
            </Button>
          </div>
          <Button variant="primary" type="submit">
            تسجيل الدخول
          </Button>
          <p className="auth-switch">
            ليس لديك حساب؟
            <Button variant="ghost" size="sm" onClick={() => switchMode('register')}>
              أنشئ حسابك
            </Button>
          </p>
        </form>
      ) : registered ? (
        <div className="auth-form">
          <Alert variant="success" title="تم إنشاء الحساب (معاينة محلية)">
            الخطوة الموثقة التالية: تفعيل حسابك برمز OTP يُرسل برسالة نصية إلى هاتفك (1.1.2) — شاشة إدخال الرمز تُبنى في
            مرحلة لاحقة، ولا حساب فعلياً الآن.
          </Alert>
          <div className="auth-row">
            <Button variant="primary" onClick={() => switchMode('login')}>
              العودة لتسجيل الدخول
            </Button>
            <Button variant="secondary" onClick={() => setRegistered(false)}>
              تعديل البيانات
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="auth-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            submitRegistration()
          }}
        >
          <h1 style={{ fontSize: 'var(--type-h2)' }}>إنشاء حساب تاجر جديد</h1>
          <Input
            label="الاسم الكامل"
            autoComplete="name"
            value={registration.name}
            error={registrationErrors.name}
            onChange={(event) => setRegistration((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            autoComplete="email"
            value={registration.email}
            error={registrationErrors.email}
            onChange={(event) => setRegistration((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            label="رقم الهاتف"
            type="tel"
            autoComplete="tel"
            helperText="يُرسل إليه رمز التفعيل OTP برسالة نصية (1.1.2)"
            value={registration.phone}
            error={registrationErrors.phone}
            onChange={(event) => setRegistration((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <div className="auth-form" style={{ gap: 'var(--space-sm)' }}>
            <PasswordInput
              label="كلمة المرور"
              autoComplete="new-password"
              helperText="ثمانية أحرف على الأقل"
              value={registration.password}
              error={registrationErrors.password}
              onChange={(value) => setRegistration((prev) => ({ ...prev, password: value }))}
            />
            <StrengthMeter password={registration.password} />
          </div>
          <div>
            <Checkbox
              label="أوافق على شروط الاستخدام"
              description="إلزامية لإنشاء حساب تاجر"
              checked={registration.termsAccepted}
              onChange={(event) => setRegistration((prev) => ({ ...prev, termsAccepted: event.target.checked }))}
            />
            {registrationErrors.terms && <p className="tw-field__error">{registrationErrors.terms}</p>}
          </div>
          <Button variant="primary" type="submit">
            إنشاء الحساب
          </Button>
          <p className="auth-switch">
            لديك حساب؟
            <Button variant="ghost" size="sm" onClick={() => switchMode('login')}>
              سجّل دخولك
            </Button>
          </p>
        </form>
      )}

      {toast && <Toast variant="success" message={toast} floating onClose={() => setToast(null)} />}
    </AuthLayout>
  )
}
