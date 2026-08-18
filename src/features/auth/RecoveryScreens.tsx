import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Button, Input, OtpInput } from '../../components/ui'
import { PasswordInput, StrengthMeter } from './PasswordField'
import { validateOtp, validateRecoveryIdentifier, validateResetPassword } from './auth-validation'
import type { ResetPasswordErrors } from './auth-validation'

/** طول رمز التفعيل الموثق (برومت 1: 6 خانات) */
const OTP_LENGTH = 6
/** مدة إعادة الإرسال (برومت 1: عداد 60 ثانية — موسومة افتراضاً في وثائق UX) */
const RESEND_SECONDS = 60

export interface RecoveryScreenProps {
  notify: (message: string) => void
  onBackToLogin: () => void
  /** يربط دالة الإرسال الحالية بزر «إظهار أخطاء التحقق» التطويري */
  bindSubmit: (submit: () => void) => void
}

/** آخر ثلاثة أرقام من الهاتف (برومت 1: «المرسل إلى هاتفك المنتهي بـ…») */
function lastDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.slice(-3) || '678'
}

/* ═══════════ 1) تفعيل الحساب OTP (1.1.2) ═══════════ */

export function OtpActivationForm({ phone, notify, onBackToLogin, bindSubmit }: RecoveryScreenProps & { phone: string }) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [activated, setActivated] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (activated || resendIn <= 0) return
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [activated, resendIn])

  const submit = () => {
    const nextError = validateOtp(code, OTP_LENGTH)
    setError(nextError)
    if (nextError) return
    setActivated(true)
    notify('تم تفعيل الحساب (معاينة محلية — لا تفعيل فعلياً)')
  }

  useEffect(() => {
    bindSubmit(submit)
  })

  if (activated) {
    return (
      <div className="auth-form">
        <Alert variant="success" title="تم تفعيل الحساب (معاينة محلية)">
          الخطوة الموثقة التالية: معالج إعداد المتجر — الاسم واللغة وحجز النطاق الفرعي فور التسجيل (1.2.1).
        </Alert>
        <div className="auth-row">
          <Button variant="primary" onClick={() => navigate('/setup')}>
            الانتقال لإعداد متجرك
          </Button>
          <Button variant="secondary" onClick={onBackToLogin}>
            العودة لتسجيل الدخول
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <h1 className="auth-title">تفعيل الحساب</h1>
      <p className="auth-subtitle">
        أدخل الرمز المُرسل برسالة نصية إلى هاتفك المنتهي بـ <span className="numeric">{lastDigits(phone)}</span>{' '}
        لتأكيد ملكية الرقم (1.1.2)
      </p>
      <OtpInput label="رمز التحقق" length={OTP_LENGTH} value={code} onChange={setCode} error={error} />
      <Button variant="primary" type="submit">
        تأكيد الرمز
      </Button>
      <div className="auth-row">
        <Button variant="secondary" size="sm" disabled={resendIn > 0} onClick={() => {
          setResendIn(RESEND_SECONDS)
          notify('أُرسل رمز جديد (معاينة محلية — لا إرسال فعلياً)')
        }}>
          إعادة إرسال الرمز
          {resendIn > 0 && (
            <>
              {' '}
              (<span className="numeric">{resendIn}</span>)
            </>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onBackToLogin}>
          العودة لتسجيل الدخول
        </Button>
      </div>
    </form>
  )
}

/* ═══════════ 2) طلب استعادة كلمة المرور (1.1.4) ═══════════ */

export function ForgotPasswordForm({
  notify,
  onBackToLogin,
  bindSubmit,
  onOpenReset,
}: RecoveryScreenProps & { onOpenReset: () => void }) {
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [sent, setSent] = useState(false)

  const submit = () => {
    const nextError = validateRecoveryIdentifier(identifier)
    setError(nextError)
    if (nextError) return
    setSent(true)
    notify('أُرسل رابط الاستعادة (معاينة محلية — لا إرسال فعلياً)')
  }

  useEffect(() => {
    bindSubmit(submit)
  })

  if (sent) {
    return (
      <div className="auth-form">
        <Alert variant="success" title="أرسلنا رابطاً آمناً مؤقتاً">
          يصلك الرابط عبر بريدك أو هاتفك (1.1.4) ومن خلاله تعيّن كلمة مرور جديدة — معاينة محلية، لا إرسال فعلياً.
        </Alert>
        <div className="auth-row">
          <Button variant="primary" onClick={onBackToLogin}>
            العودة لتسجيل الدخول
          </Button>
          {/* في المسار الفعلي تُفتح شاشة التعيين من الرابط المُرسل — هذا اختصار معاينة */}
          <Button variant="secondary" onClick={onOpenReset}>
            فتح شاشة التعيين (معاينة تطويرية)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <h1 className="auth-title">استعادة كلمة المرور</h1>
      <p className="auth-subtitle">
        أدخل بريدك أو هاتفك وسنرسل لك رابطاً آمناً مؤقتاً لإعادة ضبط كلمة المرور (1.1.4)
      </p>
      <Input
        label="البريد الإلكتروني أو رقم الهاتف"
        ltr
        autoComplete="username"
        value={identifier}
        error={error}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <Button variant="primary" type="submit">
        إرسال رابط الاستعادة
      </Button>
      <p className="auth-switch">
        تذكرت كلمة المرور؟
        <Button variant="ghost" size="sm" onClick={onBackToLogin}>
          سجّل دخولك
        </Button>
      </p>
    </form>
  )
}

/* ═══════════ 3) تعيين كلمة مرور جديدة (1.1.5 + برومت 1/ب) ═══════════ */

export function ResetPasswordForm({ notify, onBackToLogin, bindSubmit }: RecoveryScreenProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<ResetPasswordErrors>({})
  const [done, setDone] = useState(false)

  const submit = () => {
    const nextErrors = validateResetPassword(password, confirm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setDone(true)
    notify('تم تعيين كلمة المرور الجديدة (معاينة محلية — لا تغيير فعلياً)')
  }

  useEffect(() => {
    bindSubmit(submit)
  })

  if (done) {
    return (
      <div className="auth-form">
        <Alert variant="success" title="تم تعيين كلمة المرور الجديدة (معاينة محلية)">
          استخدمها في تسجيل دخولك القادم — لا تغيير فعلياً في هذه المرحلة.
        </Alert>
        <Button variant="primary" onClick={onBackToLogin}>
          العودة لتسجيل الدخول
        </Button>
      </div>
    )
  }

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <h1 className="auth-title">تعيين كلمة مرور جديدة</h1>
      <div className="auth-form" style={{ gap: 'var(--space-sm)' }}>
        <PasswordInput
          label="كلمة المرور الجديدة"
          autoComplete="new-password"
          helperText="ثمانية أحرف على الأقل"
          value={password}
          error={errors.password}
          onChange={setPassword}
        />
        <StrengthMeter password={password} />
      </div>
      <PasswordInput
        label="تأكيد كلمة المرور"
        autoComplete="new-password"
        value={confirm}
        error={errors.confirm}
        onChange={setConfirm}
      />
      <Button variant="primary" type="submit">
        تأكيد
      </Button>
      <p className="auth-switch">
        <Button variant="ghost" size="sm" onClick={onBackToLogin}>
          العودة لتسجيل الدخول
        </Button>
      </p>
    </form>
  )
}
