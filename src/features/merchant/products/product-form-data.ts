import type { ProductStatus } from '../../../types/status'

/**
 * أنواع وبيانات نموذج المنتج — محلية بالكامل، لا حفظ فعلياً.
 * الحقول من المتطلبات حصراً (1.4.x + برومت 5/P6). المحوران الموثقان: المقاس واللون (1.4.6).
 */

/** تركيبة متغيرات واحدة (سعر/كمية/SKU مستقلة — 1.4.7) */
export interface ComboState {
  /** مفتاح ثابت مشتق من قيم المحاور («M/أزرق») */
  key: string
  label: string
  price: string
  quantity: string
  sku: string
  /** حذف قابل للتراجع قبل الحفظ (برومت 5) — يحمي من تعارض G8 */
  removed: boolean
}

export interface ProductFormState {
  name: string
  description: string
  sku: string
  category: string
  /** الحالة الموثقة للنموذج: منشور/مسودة (برومت 5) — الأرشفة خارج هذه المرحلة */
  status: Extract<ProductStatus, 'active' | 'draft'>
  /** تُستخدم فقط عند عدم تفعيل المتغيرات (برومت 5: بطاقة التسعير تظهر إن لا متغيرات) */
  price: string
  quantity: string
  /** حد تنبيه انخفاض المخزون (1.4.12) — دلالته النهائية معلّقة على G4 */
  lowStockThreshold: string
  variantsEnabled: boolean
  sizes: string[]
  colors: string[]
  combos: ComboState[]
}

/**
 * قائمة فئات تجريبية — مصدر التصنيفات وإدارتها قرار معلّق (M5 في تحليل الفجوات).
 */
export const CATEGORY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'fashion', label: 'أزياء' },
  { value: 'care', label: 'عناية شخصية' },
  { value: 'electronics', label: 'إلكترونيات' },
  { value: 'food', label: 'غذائي' },
]

/** توليد التركيبات تقاطعياً (1.4.6) مع الحفاظ على قيم التركيبات الموجودة بمفتاحها */
export function syncCombos(previous: ComboState[], sizes: string[], colors: string[]): ComboState[] {
  const axes = [sizes, colors].filter((values) => values.length > 0)
  if (axes.length === 0) return []

  const keys = axes.reduce<string[][]>((acc, values) => acc.flatMap((combo) => values.map((value) => [...combo, value])), [[]])

  return keys.map((parts) => {
    const key = parts.join('/')
    const existing = previous.find((combo) => combo.key === key)
    return (
      existing ?? {
        key,
        label: parts.join(' / '),
        price: '',
        quantity: '',
        sku: '',
        removed: false,
      }
    )
  })
}

export function emptyForm(): ProductFormState {
  return {
    name: '',
    description: '',
    sku: '',
    category: '',
    status: 'active',
    price: '',
    quantity: '',
    lowStockThreshold: '',
    variantsEnabled: false,
    sizes: [],
    colors: [],
    combos: [],
  }
}

/** بيانات وضع التعديل — منتج تجريبي محلي (متسق مع قائمة المنتجات) */
export function editMockForm(): ProductFormState {
  const sizes = ['S', 'M', 'L']
  const colors = ['أزرق', 'أبيض']
  const values: Record<string, { price: string; quantity: string; sku: string }> = {
    'S/أزرق': { price: '55', quantity: '4', sku: 'TS-CTN-S-BL' },
    'S/أبيض': { price: '55', quantity: '5', sku: 'TS-CTN-S-WH' },
    'M/أزرق': { price: '55', quantity: '6', sku: 'TS-CTN-M-BL' },
    'M/أبيض': { price: '58', quantity: '5', sku: 'TS-CTN-M-WH' },
    'L/أزرق': { price: '58', quantity: '3', sku: 'TS-CTN-L-BL' },
    'L/أبيض': { price: '58', quantity: '3', sku: 'TS-CTN-L-WH' },
  }
  const combos = syncCombos([], sizes, colors).map((combo) => ({ ...combo, ...values[combo.key] }))
  return {
    name: 'قميص قطني رجالي',
    description: 'قميص قطني مريح بقصّة عصرية، مناسب للاستخدام اليومي.',
    sku: 'TS-CTN-M',
    category: 'fashion',
    status: 'active',
    price: '',
    quantity: '',
    lowStockThreshold: '5',
    variantsEnabled: true,
    sizes,
    colors,
    combos,
  }
}

/** المخزون الصافي لوضع التعديل (1.4.9) — أرقام تجريبية للعرض فقط */
export const EDIT_MOCK_NET_STOCK = { total: 29, reserved: 3, available: 26 }
