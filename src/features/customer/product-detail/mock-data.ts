/**
 * بيانات تجريبية محلية لصفحة تفاصيل المنتج — حقول يراها الزبون حصراً (2.1.5):
 * لا SKU ولا كميات داخلية؛ «تبقى X» رسالة توفر موجهة للزبون موثقة (برومت 13 / 2.2.2).
 * لا تُستورد خارج هذه الميزة.
 */

export type Availability = 'in' | 'low' | 'out'

export interface DetailAxis {
  key: 'size' | 'type'
  label: string
  options: string[]
}

export interface DetailCombo {
  size?: string
  type?: string
  price: number
  availability: Availability
  /** المتبقي المعلن للزبون عند الانخفاض فقط (برومت 13: «تبقى 5 قطع فقط») */
  remaining?: number
}

export interface DetailProduct {
  id: string
  name: string
  categoryLabel: string
  shortDescription: string
  longDescription: string
  price: number
  availability: Availability
  remaining?: number
  axes?: DetailAxis[]
  combos?: DetailCombo[]
}

/** منتج بسيط متوفر (الافتراضي) */
export const SIMPLE_PRODUCT: DetailProduct = {
  id: 'c3',
  name: 'زيت جوز الهند العضوي',
  categoryLabel: 'العناية الشخصية',
  shortDescription: 'زيت طبيعي 100% معصور على البارد للعناية بالشعر والبشرة.',
  longDescription:
    'زيت جوز هند عضوي نقي معصور على البارد دون أي إضافات، مناسب لترطيب الشعر الجاف وتغذية البشرة، ويصلح للاستخدام اليومي. عبوة زجاجية 250مل محكمة الإغلاق.',
  price: 22,
  availability: 'in',
}

/** منتج بمتغيرات مطلوبة (برومت 13: الحجم والنوع، وخيار غير متوفر مشطوب) */
export const VARIANT_PRODUCT: DetailProduct = {
  id: 'c1',
  name: 'شامبو أرغان',
  categoryLabel: 'العناية الشخصية',
  shortDescription: 'شامبو بزيت الأرغان المغربي لتنظيف لطيف وترطيب عميق.',
  longDescription:
    'تركيبة غنية بزيت الأرغان الطبيعي تناسب الاستخدام اليومي، خالية من البارابين. اختر الحجم والنوع المناسبين لشعرك.',
  price: 45,
  availability: 'in',
  axes: [
    { key: 'size', label: 'الحجم', options: ['400مل', '750مل'] },
    { key: 'type', label: 'النوع', options: ['عادي', 'مضاد للقشرة'] },
  ],
  combos: [
    { size: '400مل', type: 'عادي', price: 45, availability: 'low', remaining: 5 },
    { size: '400مل', type: 'مضاد للقشرة', price: 52, availability: 'in' },
    { size: '750مل', type: 'عادي', price: 68, availability: 'in' },
    { size: '750مل', type: 'مضاد للقشرة', price: 75, availability: 'out' },
  ],
}

/** منتج نفدت كل خياراته */
export const OUT_PRODUCT: DetailProduct = {
  id: 'p1',
  name: 'عطر العود الملكي 50مل',
  categoryLabel: 'عطور',
  shortDescription: 'عطر شرقي فاخر بخلاصة العود الطبيعي.',
  longDescription: 'تركيبة مركزة تدوم طويلاً بنفحات العود والعنبر — يعود للتوفر قريباً.',
  price: 260,
  availability: 'out',
}

export function comboFor(product: DetailProduct, size?: string, type?: string): DetailCombo | undefined {
  return product.combos?.find((combo) => combo.size === size && combo.type === type)
}

/**
 * هل الخيار متاح ضمن اختيار المحور الآخر الحالي؟
 * غير المتوفر يُعرض مشطوباً معطلاً (برومت 13) لا مخفياً.
 */
export function optionAvailable(product: DetailProduct, axis: 'size' | 'type', option: string, otherValue?: string): boolean {
  const combos = product.combos ?? []
  return combos.some((combo) => {
    if (axis === 'size' && combo.size !== option) return false
    if (axis === 'type' && combo.type !== option) return false
    if (otherValue !== undefined) {
      const other = axis === 'size' ? combo.type : combo.size
      if (other !== otherValue) return false
    }
    return combo.availability !== 'out'
  })
}
