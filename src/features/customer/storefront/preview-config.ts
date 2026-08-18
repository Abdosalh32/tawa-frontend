import { useSyncExternalStore } from 'react'
import { THEME_DEFAULT_COLORS } from '../../../types/store-theme'
import type { TemplateKey, ThemeColors } from '../../../types/store-theme'
import type { DiscountRule } from '../../../types/discount'

/**
 * إعدادات معاينة الستورفرونت (قالب + لوحة ألوان) وأسطر سلة المعاينة المحلية —
 * مخزن واحد في الذاكرة تتشاركه شاشات الزبون (تصفح/منتج/سلة) دون تكرار حالة.
 * لا استمرارية ولا Storage — يُستبدل بربط فعلي لاحقاً.
 *
 * ── خريطة الاستبدال بسلة الخادم (`cart_token`) ──────────────────────────────
 * الباكند يملك سلة ضيف فعلية، فهذه الدوال تقابلها واحدة بواحدة عند الربط:
 *   • `cart_token` نص فريد يصدره الخادم مع أول سلة ويحيا ٧ أيام؛ نحفظه محلياً
 *     ونرسله في كل نداء، فهو ما يعرّف سلة الزائر بلا حساب.
 *   • `useStorePreviewConfig().lines` ← GET  /v1/storefront/{store}/cart
 *   • `addCartLine`                  ← POST /v1/storefront/{store}/cart/items
 *   • `setCartLineQuantity`          ← PUT  /v1/storefront/{store}/cart/items/{itemId}
 *   • `removeCartLine`               ← DELETE …/cart/items/{itemId}
 *   • الخادم يحجز المخزون ١٥ دقيقة لكل `cart_token` ويجدّد الحجز مع كل تعديل،
 *     ويرفض تجاوز المتاح بـ 422 برسالة تذكر الكمية المتبقية — تُعرض كما تصل.
 *   • عند نجاح الإتمام يحذف الخادم السلة ويحرّر الحجز، فيُمسح الرمز محلياً.
 * الخصم يبقى كوداً نصياً (`discount_code`) يُرسل مع الطلب لا مبلغاً محسوباً هنا.
 */

/** لوحات تجريبية بمفاتيح `colors` الستة نفسها التي يخزّنها الباكند */
export const BRAND_PRESETS: ReadonlyArray<{ key: string; label: string; colors: ThemeColors }> = [
  { key: 'classic', label: 'ألوان كلاسيك الافتراضية', colors: THEME_DEFAULT_COLORS.classic },
  { key: 'modern', label: 'ألوان مودرن الافتراضية (داكنة)', colors: THEME_DEFAULT_COLORS.modern },
  {
    key: 'ruby',
    label: 'عنابي دافئ',
    colors: {
      primary: '#8a2432',
      secondary: '#5c1622',
      header_bg: '#8a2432',
      footer_bg: '#3b0e17',
      text_color: '#221418',
      background: '#faf6f4',
    },
  },
  {
    key: 'forest',
    label: 'أخضر زيتوني',
    colors: {
      primary: '#2f6b3a',
      secondary: '#1d4726',
      header_bg: '#ffffff',
      footer_bg: '#12301a',
      text_color: '#101a12',
      background: '#f7f9f5',
    },
  },
]

/** سطر سلة بحقول يراها الزبون فقط — لا SKU ولا كميات مخزون داخلية */
export interface CartLine {
  /** مفتاح السطر: المنتج + تركيبته */
  id: string
  name: string
  /** وصف المتغير المختار («400مل / عادي») */
  variant?: string
  unitPrice: number
  quantity: number
  /** سقف الكمية المعلن للزبون (التحقق الفوري 2.2.2) — يغيب حين لا إعلان */
  maxQuantity?: number
}

/** كود خصم مُطبَّق محلياً — يقابل `orders.discount_code` + `discount_amount` */
export interface AppliedDiscount {
  code: string
  amount: number
  rule: DiscountRule
}

export interface StorePreviewConfig {
  template: TemplateKey
  presetKey: string
  lines: readonly CartLine[]
  /** null = لا كود مُطبَّق */
  discount: AppliedDiscount | null
}

/** بذرة سلة المعاينة (عنصران — متسقة مع بيانات المتجر التجريبية) */
function seedLines(): CartLine[] {
  return [
    { id: 'c1|400مل|عادي', name: 'شامبو أرغان', variant: '400مل / عادي', unitPrice: 45, quantity: 1, maxQuantity: 5 },
    { id: 'c2', name: 'كريم زبدة الشيا', variant: 'حجم متوسط', unitPrice: 18, quantity: 1 },
  ]
}

let config: StorePreviewConfig = { template: 'classic', presetKey: 'classic', lines: seedLines(), discount: null }
const listeners = new Set<() => void>()

function emit(next: StorePreviewConfig): void {
  config = next
  listeners.forEach((listener) => listener())
}

export function setPreviewConfig(patch: Partial<Pick<StorePreviewConfig, 'template' | 'presetKey'>>): void {
  emit({ ...config, ...patch })
}

function clampQuantity(quantity: number, maxQuantity?: number): number {
  const floored = Math.max(1, quantity)
  return maxQuantity !== undefined ? Math.min(floored, maxQuantity) : floored
}

/** إضافة سطر — الدمج بالمفتاح مع احترام السقف المعلن */
export function addCartLine(line: CartLine): void {
  const existing = config.lines.find((item) => item.id === line.id)
  const lines = existing
    ? config.lines.map((item) =>
        item.id === line.id ? { ...item, quantity: clampQuantity(item.quantity + line.quantity, item.maxQuantity) } : item,
      )
    : [...config.lines, { ...line, quantity: clampQuantity(line.quantity, line.maxQuantity) }]
  emit({ ...config, lines, discount: null })
}

export function setCartLineQuantity(id: string, quantity: number): void {
  emit({
    ...config,
    lines: config.lines.map((item) => (item.id === id ? { ...item, quantity: clampQuantity(quantity, item.maxQuantity) } : item)),
    /* الخصم يُلغى عند تغيّر المجموع كي لا يبقى مبلغ محسوب على سلة قديمة */
    discount: null,
  })
}

export function removeCartLine(id: string): void {
  emit({ ...config, lines: config.lines.filter((item) => item.id !== id), discount: null })
}

/** إعادة تعبئة سلة المعاينة بالبذرة — أداة تطويرية */
export function resetPreviewCart(): void {
  emit({ ...config, lines: seedLines(), discount: null })
}

export function applyPreviewDiscount(discount: AppliedDiscount): void {
  emit({ ...config, discount })
}

export function clearPreviewDiscount(): void {
  emit({ ...config, discount: null })
}

export function cartQuantityOf(current: StorePreviewConfig): number {
  return current.lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function useStorePreviewConfig(): StorePreviewConfig {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    () => config,
  )
}

export function presetOf(presetKey: string) {
  return BRAND_PRESETS.find((preset) => preset.key === presetKey) ?? BRAND_PRESETS[0]
}
