/**
 * أنواع وتحقق معالج إعداد المتجر (1.2.1 + برومت 2) — محلي بالكامل، لا حجز فعلياً.
 * الخطوات الموثقة الثلاث: بيانات المتجر ← اللغة ← النطاق الفرعي، ثم شاشة النجاح.
 */

export type StoreLanguage = 'ar' | 'en'

export interface StoreSetupState {
  storeName: string
  /** فئة النشاط (برومت 2: منسدلة أزياء/إلكترونيات/غذائي…) */
  category: string
  language: StoreLanguage
  /** النطاق الفرعي قبل اللاحقة الثابتة .tawa.ly */
  subdomain: string
}

export const ACTIVITY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'fashion', label: 'أزياء' },
  { value: 'electronics', label: 'إلكترونيات' },
  { value: 'food', label: 'غذائي' },
  { value: 'care', label: 'عناية شخصية' },
  { value: 'home', label: 'منزل وديكور' },
]

export function emptySetup(): StoreSetupState {
  return { storeName: '', category: '', language: 'ar', subdomain: '' }
}

export interface Step1Errors {
  storeName?: string
  category?: string
}

export function validateStep1(state: StoreSetupState): Step1Errors {
  const errors: Step1Errors = {}
  if (state.storeName.trim() === '') {
    errors.storeName = 'اسم المتجر مطلوب — يظهر لزبائنك في كل مكان'
  }
  if (state.category === '') {
    errors.category = 'اختر فئة نشاط متجرك'
  }
  return errors
}

/**
 * تحقق «صيغة» محلي فقط — قواعد الصيغة افتراض واجهة (غير منصوصة):
 * أحرف لاتينية صغيرة وأرقام وشرطات، يبدأ بحرف ولا ينتهي بشرطة، 3–30 حرفاً.
 * التوفر والحجز الفعليان فحص خلفي (1.2.1) — لا يُحاكيان هنا.
 */
export function validateSubdomain(subdomain: string): string | undefined {
  const value = subdomain.trim()
  if (value === '') {
    return 'أدخل النطاق الفرعي لمتجرك'
  }
  if (value.length < 3 || value.length > 30 || !/^[a-z][a-z0-9-]*[a-z0-9]$/.test(value)) {
    return 'الصيغة: أحرف لاتينية صغيرة وأرقام وشرطات (3–30)، يبدأ بحرف ولا ينتهي بشرطة'
  }
  return undefined
}
