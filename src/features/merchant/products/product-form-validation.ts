import type { ProductFormState } from './product-form-data'

/**
 * تحقق محلي عند الإرسال — رسائل عربية تقول ما حدث وما العمل (أسس §7.6).
 */

export interface ValidationResult {
  /** أخطاء الحقول المفردة، بمفاتيح ثابتة */
  fieldErrors: Partial<Record<'name' | 'category' | 'price' | 'quantity' | 'lowStockThreshold' | 'variants', string>>
  /** أخطاء التركيبات بمفتاح التركيبة */
  comboErrors: Record<string, string>
  /** ملخص الرسائل لعرضه في تنبيه أعلى النموذج */
  messages: string[]
  valid: boolean
}

function isPositiveNumber(value: string): boolean {
  const parsed = Number(value)
  return value.trim() !== '' && Number.isFinite(parsed) && parsed > 0
}

function isNonNegativeInteger(value: string): boolean {
  const parsed = Number(value)
  return value.trim() !== '' && Number.isInteger(parsed) && parsed >= 0
}

export function validateProductForm(form: ProductFormState): ValidationResult {
  const fieldErrors: ValidationResult['fieldErrors'] = {}
  const comboErrors: ValidationResult['comboErrors'] = {}

  if (form.name.trim() === '') {
    fieldErrors.name = 'اسم المنتج مطلوب — يظهر للزبائن في واجهة المتجر'
  }

  if (form.category === '') {
    fieldErrors.category = 'اختر فئة المنتج ليظهر في التصنيف الصحيح'
  }

  if (!form.variantsEnabled) {
    if (!isPositiveNumber(form.price)) {
      fieldErrors.price = 'أدخل سعراً رقمياً أكبر من صفر'
    }
    if (!isNonNegativeInteger(form.quantity)) {
      fieldErrors.quantity = 'أدخل كمية صحيحة (0 أو أكثر)'
    }
  } else {
    const activeCombos = form.combos.filter((combo) => !combo.removed)
    if (form.sizes.length === 0 && form.colors.length === 0) {
      fieldErrors.variants = 'أضف قيمة واحدة على الأقل لأحد المحورين (المقاس أو اللون)'
    } else if (activeCombos.length === 0) {
      fieldErrors.variants = 'كل التركيبات محذوفة — استعد تركيبة واحدة على الأقل أو عطّل المتغيرات'
    }
    for (const combo of activeCombos) {
      if (!isPositiveNumber(combo.price)) {
        comboErrors[combo.key] = `التركيبة «${combo.label}»: أدخل سعراً رقمياً أكبر من صفر`
      } else if (!isNonNegativeInteger(combo.quantity)) {
        comboErrors[combo.key] = `التركيبة «${combo.label}»: أدخل كمية صحيحة (0 أو أكثر)`
      }
    }
  }

  if (form.lowStockThreshold.trim() !== '' && !isNonNegativeInteger(form.lowStockThreshold)) {
    fieldErrors.lowStockThreshold = 'حد التنبيه يُدخل رقماً صحيحاً (0 أو أكثر)'
  }

  const messages = [...Object.values(fieldErrors), ...Object.values(comboErrors)]
  return { fieldErrors, comboErrors, messages, valid: messages.length === 0 }
}
