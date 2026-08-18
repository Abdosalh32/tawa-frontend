import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Button, Checkbox, Input, Radio, Toast } from '../../components/ui'
import { AuthLayout } from './AuthLayout'
import { PasswordInput, StrengthMeter } from './PasswordField'
import { ForgotPasswordForm, OtpActivationForm, ResetPasswordForm } from './RecoveryScreens'
import { validateLogin, validateRegistration } from './auth-validation'
import type { LoginErrors, LoginFormState, RegistrationErrors, RegistrationFormState } from './auth-validation'

type AuthMode = 'login' | 'register' | 'otp' | 'forgot' | 'reset'

const EMPTY_LOGIN: LoginFormState = { identifier: '', password: '', remember: false }
const EMPTY_REGISTRATION: RegistrationFormState = { name: '', email: '', phone: '', password: '', termsAccepted: false }

export function MerchantAuth() {
  const navigate = useNavigate()
  /* الافتراضي: تسجيل الدخول */
  const [mode, setMode] = useState<AuthMode>('login')
  const [login, setLogin] = useState<LoginFormState>(EMPTY_LOGIN)
  const [registration, setRegistration] = useState<RegistrationFormState>(EMPTY_REGISTRATION)
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({})
  const [registrationErrors, setRegistrationErrors] = useState<RegistrationErrors>({})
  const [registered, setRegistered] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  /** دالة الإرسال الحالية — تربطها كل شاشة لزر «إظهار أخطاء التحقق» التطويري */
  const devSubmitRef = useRef<() => void>(() => undefined)
  const bindSubmit = (submit: () => void) => {
    devSubmitRef.current = submit
  }

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
    /* لا جلسة فعلية بعد — الدخول المحلي الناجح ينقل للوحة مباشرة */
    navigate('/')
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

  /* ربط زر الأخطاء التطويري بوضعي الدخول/التسجيل (الشاشات الأخرى تربط نفسها) */
  useEffect(() => {
    if (mode === 'login') devSubmitRef.current = submitLogin
    else if (mode === 'register') devSubmitRef.current = submitRegistration
  })

  const activeErrors: string[] =
    mode === 'login' ? Object.values(loginErrors) : mode === 'register' ? Object.values(registrationErrors) : []

  const devControls = (
    <fieldset className="dev-fieldset">
      <legend>أداة معاينة تطويرية — لا مصادقة فعلية ولا حسابات حقيقية</legend>
      <div className="dev-fieldset__options">
        <Radio name="auth-mode" label="تسجيل الدخول (الافتراضي)" checked={mode === 'login'} onChange={() => switchMode('login')} />
        <Radio name="auth-mode" label="إنشاء حساب" checked={mode === 'register'} onChange={() => switchMode('register')} />
        <Radio name="auth-mode" label="تفعيل OTP" checked={mode === 'otp'} onChange={() => switchMode('otp')} />
        <Radio name="auth-mode" label="نسيت كلمة المرور" checked={mode === 'forgot'} onChange={() => switchMode('forgot')} />
        <Radio name="auth-mode" label="تعيين كلمة مرور جديدة" checked={mode === 'reset'} onChange={() => switchMode('reset')} />
        <Button variant="secondary" size="sm" onClick={() => devSubmitRef.current()}>
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
          <h1 className="auth-title">تسجيل دخول التاجر</h1>
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
            <Button variant="ghost" size="sm" onClick={() => switchMode('forgot')}>
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
      ) : mode === 'otp' ? (
        <OtpActivationForm
          phone={registration.phone || '+218 91 234 5678'}
          notify={setToast}
          onBackToLogin={() => switchMode('login')}
          bindSubmit={bindSubmit}
        />
      ) : mode === 'forgot' ? (
        <ForgotPasswordForm
          notify={setToast}
          onBackToLogin={() => switchMode('login')}
          onOpenReset={() => switchMode('reset')}
          bindSubmit={bindSubmit}
        />
      ) : mode === 'reset' ? (
        <ResetPasswordForm notify={setToast} onBackToLogin={() => switchMode('login')} bindSubmit={bindSubmit} />
      ) : registered ? (
        <div className="auth-form">
          <Alert variant="success" title="تم إنشاء الحساب (معاينة محلية)">
            الخطوة الموثقة التالية: تفعيل حسابك برمز OTP يُرسل برسالة نصية إلى هاتفك (1.1.2) — ولا حساب فعلياً الآن.
          </Alert>
          <div className="auth-row">
            <Button variant="primary" onClick={() => setMode('otp')}>
              المتابعة لتفعيل الحساب (معاينة)
            </Button>
            <Button variant="secondary" onClick={() => switchMode('login')}>
              العودة لتسجيل الدخول
            </Button>
            <Button variant="ghost" onClick={() => setRegistered(false)}>
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
          <h1 className="auth-title">إنشاء حساب تاجر جديد</h1>
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
