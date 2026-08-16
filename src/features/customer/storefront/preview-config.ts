import { useSyncExternalStore } from 'react'
import { DEFAULT_COLORS } from '../../../types/store-theme'
import type { ColorRole, TemplateKey } from '../../../types/store-theme'

/**
 * إعدادات معاينة الستورفرونت (قالب + لوحة ألوان) وأسطر سلة المعاينة المحلية —
 * مخزن واحد في الذاكرة تتشاركه شاشات الزبون (تصفح/منتج/سلة) دون تكرار حالة.
 * لا استمرارية ولا Storage — يُستبدل بربط فعلي لاحقاً.
 */

export const BRAND_PRESETS: ReadonlyArray<{ key: string; label: string; colors: Record<ColorRole, string> }> = [
  { key: 'default', label: 'الأزرق الافتراضي', colors: DEFAULT_COLORS },
  {
    key: 'ruby',
    label: 'عنابي دافئ',
    colors: { primary: '#8a2432', secondary: '#5c1622', background: '#faf6f4', surface: '#ffffff', text: '#221418' },
  },
  {
    key: 'forest',
    label: 'أخضر زيتوني',
    colors: { primary: '#2f6b3a', secondary: '#1d4726', background: '#f7f9f5', surface: '#fdfffc', text: '#101a12' },
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

export interface StorePreviewConfig {
  template: TemplateKey
  presetKey: string
  lines: readonly CartLine[]
}

/** بذرة سلة المعاينة (عنصران — متسقة مع بيانات المتجر التجريبية) */
function seedLines(): CartLine[] {
  return [
    { id: 'c1|400مل|عادي', name: 'شامبو أرغان', variant: '400مل / عادي', unitPrice: 45, quantity: 1, maxQuantity: 5 },
    { id: 'c2', name: 'كريم زبدة الشيا', variant: 'حجم متوسط', unitPrice: 18, quantity: 1 },
  ]
}

let config: StorePreviewConfig = { template: 'modern', presetKey: 'default', lines: seedLines() }
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
  emit({ ...config, lines })
}

export function setCartLineQuantity(id: string, quantity: number): void {
  emit({
    ...config,
    lines: config.lines.map((item) => (item.id === id ? { ...item, quantity: clampQuantity(quantity, item.maxQuantity) } : item)),
  })
}

export function removeCartLine(id: string): void {
  emit({ ...config, lines: config.lines.filter((item) => item.id !== id) })
}

/** إعادة تعبئة سلة المعاينة بالبذرة — أداة تطويرية */
export function resetPreviewCart(): void {
  emit({ ...config, lines: seedLines() })
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
