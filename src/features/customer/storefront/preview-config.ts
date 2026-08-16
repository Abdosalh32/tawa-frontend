import { useSyncExternalStore } from 'react'
import { DEFAULT_COLORS } from '../../../types/store-theme'
import type { ColorRole, TemplateKey } from '../../../types/store-theme'

/**
 * إعدادات معاينة الستورفرونت (قالب + لوحة ألوان + عدّاد سلة المعاينة) —
 * مخزن محلي بسيط في الذاكرة كي تتشارك شاشات الزبون التطويرية الإعداد نفسه.
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

export interface StorePreviewConfig {
  template: TemplateKey
  presetKey: string
  /** عدّاد سلة المعاينة المحلية — يبدأ بعنصرين (بيانات تجريبية) */
  cartCount: number
}

let config: StorePreviewConfig = { template: 'modern', presetKey: 'default', cartCount: 2 }
const listeners = new Set<() => void>()

export function setPreviewConfig(patch: Partial<StorePreviewConfig>): void {
  config = { ...config, ...patch }
  listeners.forEach((listener) => listener())
}

export function addToPreviewCart(quantity: number): void {
  setPreviewConfig({ cartCount: config.cartCount + quantity })
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
