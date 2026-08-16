/**
 * بيانات تجريبية محلية لواجهة الزبون — منتجات «منشورة ومتاحة للشراء» فقط (2.1.1).
 * حقول يراها الزبون حصراً: لا SKU ولا كميات مخزون داخلية.
 * لا تُستورد خارج ميزة الستورفرونت.
 */

export type StorefrontCategory = 'care' | 'fashion' | 'perfume' | 'home'

export const CATEGORIES: ReadonlyArray<{ key: StorefrontCategory; label: string }> = [
  { key: 'care', label: 'العناية الشخصية' },
  { key: 'fashion', label: 'أزياء' },
  { key: 'perfume', label: 'عطور' },
  { key: 'home', label: 'منزل وديكور' },
]

export interface StorefrontProduct {
  id: string
  name: string
  price: number
  category: StorefrontCategory
  /** خيارات اللون المتاحة (لفلترة 2.1.4) */
  colors?: string[]
  /** خيارات المقاس المتاحة (لفلترة 2.1.4) */
  sizes?: string[]
  /** نفدت كل خياراته — تظهر شارة «نفد» ويُعطّل الفعل */
  outOfStock?: boolean
}

/** أسماء الألوان مع درجات عرض لدوائر الفلتر (الاسم النصي هو حامل المعنى) */
export const COLOR_SWATCHES: ReadonlyArray<{ name: string; hex: string }> = [
  { name: 'أحمر', hex: '#c0392b' },
  { name: 'أزرق', hex: '#2a78d6' },
  { name: 'أبيض', hex: '#f4f4f2' },
  { name: 'أخضر', hex: '#1e8449' },
]

export const SIZE_OPTIONS: readonly string[] = ['S', 'M', 'L']

export const STOREFRONT_PRODUCTS: readonly StorefrontProduct[] = [
  { id: 'c1', name: 'شامبو أرغان 400مل', price: 45, category: 'care' },
  { id: 'c2', name: 'كريم زبدة الشيا', price: 18, category: 'care' },
  { id: 'c3', name: 'زيت جوز الهند العضوي', price: 22, category: 'care' },
  { id: 'c4', name: 'مقشر القهوة العربية', price: 15, category: 'care' },
  { id: 'f1', name: 'قميص قطني رجالي', price: 55, category: 'fashion', colors: ['أزرق', 'أبيض'], sizes: ['S', 'M', 'L'] },
  { id: 'f2', name: 'عباءة صيفية خفيفة', price: 120, category: 'fashion', colors: ['أحمر'], sizes: ['M', 'L'] },
  { id: 'p1', name: 'عطر العود الملكي 50مل', price: 260, category: 'perfume', outOfStock: true },
  { id: 'p2', name: 'ماء ورد طبيعي', price: 12, category: 'perfume' },
  { id: 'h1', name: 'سجادة صلاة مخملية', price: 35, category: 'home', colors: ['أحمر', 'أخضر'] },
  { id: 'h2', name: 'مبخرة خزفية مزخرفة', price: 48, category: 'home' },
]
