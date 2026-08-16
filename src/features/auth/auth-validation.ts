/**
 * تحقق محلي لنماذج المصادقة — رسائل عربية تقول ما حدث وما العمل.
 * لا مصادقة فعلية في هذه المرحلة.
 */

export interface LoginFormState {
  /** بريد إلكتروني أو رقم هاتف (برومت 1) — أيهما المعتمد نهائياً سؤال مفتوح في F1 */
  identifier: string
  password: string
  remember: boolean
}

export interface RegistrationFormState {
  name: string
  email: string
  phone: string
  password: string
  termsAccepted: boolean
}

export interface LoginErrors {
  identifier?: string
  password?: string
}

export interface RegistrationErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  terms?: string
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export function validateLogin(form: LoginFormState): LoginErrors {
  const errors: LoginErrors = {}
  if (form.identifier.trim() === '') {
    errors.identifier = 'أدخل بريدك الإلكتروني أو رقم هاتفك'
  }
  if (form.password === '') {
    errors.password = 'أدخل كلمة المرور'
  }
  return errors
}

export function validateRegistration(form: RegistrationFormState): RegistrationErrors {
  const errors: RegistrationErrors = {}
  if (form.name.trim() === '') {
    errors.name = 'الاسم الكامل مطلوب'
  }
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'أدخل بريداً إلكترونياً صالحاً — مثل name@example.com'
  }
  const phoneDigits = form.phone.replace(/[\s-]/g, '')
  if (!/^\+?\d{9,15}$/.test(phoneDigits)) {
    errors.phone = 'أدخل رقم هاتف صالحاً — يُرسل إليه رمز التفعيل'
  }
  if (form.password.length < 8) {
    errors.password = 'كلمة المرور ثمانية أحرف على الأقل'
  }
  if (!form.termsAccepted) {
    errors.terms = 'الموافقة على شروط الاستخدام إلزامية لإنشاء الحساب'
  }
  return errors
}

/** رمز التفعيل: 6 أرقام (برومت 1) */
export function validateOtp(code: string, length: number): string | undefined {
  if (!new RegExp(`^\\d{${length}}$`).test(code)) {
    return `أدخل رمز التحقق المكوَّن من ${length} أرقام كاملاً`
  }
  return undefined
}

/** معرّف الاستعادة: بريد أو هاتف (1.1.4) */
export function validateRecoveryIdentifier(identifier: string): string | undefined {
  if (identifier.trim() === '') {
    return 'أدخل بريدك الإلكتروني أو رقم هاتفك لإرسال رابط الاستعادة'
  }
  return undefined
}

export interface ResetPasswordErrors {
  password?: string
  confirm?: string
}

/** تعيين كلمة مرور جديدة (1.1.5): حقلان متطابقان بنفس سياسة الطول الموثقة */
export function validateResetPassword(password: string, confirm: string): ResetPasswordErrors {
  const errors: ResetPasswordErrors = {}
  if (password.length < 8) {
    errors.password = 'كلمة المرور ثمانية أحرف على الأقل'
  }
  if (confirm !== password || confirm === '') {
    errors.confirm = 'كلمتا المرور غير متطابقتين — أعد كتابة الكلمة نفسها'
  }
  return errors
}

export type PasswordStrength = 'weak' | 'medium' | 'strong'

/** مؤشر قوة مبسّط (برومت 1) — طول + تنوع أحرف، للعرض المحلي فقط */
export function passwordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 8) score += 1
  if (/\d/.test(password)) score += 1
  if (/[A-Zء-ي]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return 'weak'
  if (score === 2) return 'medium'
  return 'strong'
}

export const STRENGTH_LABEL: Record<PasswordStrength, string> = {
  weak: 'ضعيفة',
  medium: 'متوسطة',
  strong: 'قوية',
}
