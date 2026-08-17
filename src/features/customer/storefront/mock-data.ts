import type { DiscountRule } from '../../../types/discount'

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
  /** السعر قبل الخصم — products.compare_at_price (يُعرض مشطوباً) */
  compareAtPrice?: number
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
  { id: 'c1', name: 'شامبو أرغان 400مل', price: 45, compareAtPrice: 60, category: 'care' },
  { id: 'c2', name: 'كريم زبدة الشيا', price: 18, category: 'care' },
  { id: 'c3', name: 'زيت جوز الهند العضوي', price: 22, category: 'care' },
  { id: 'c4', name: 'مقشر القهوة العربية', price: 15, category: 'care' },
  { id: 'f1', name: 'قميص قطني رجالي', price: 55, compareAtPrice: 70, category: 'fashion', colors: ['أزرق', 'أبيض'], sizes: ['S', 'M', 'L'] },
  { id: 'f2', name: 'عباءة صيفية خفيفة', price: 120, category: 'fashion', colors: ['أحمر'], sizes: ['M', 'L'] },
  { id: 'p1', name: 'عطر العود الملكي 50مل', price: 260, category: 'perfume', outOfStock: true },
  { id: 'p2', name: 'ماء ورد طبيعي', price: 12, category: 'perfume' },
  { id: 'h1', name: 'سجادة صلاة مخملية', price: 35, compareAtPrice: 42, category: 'home', colors: ['أحمر', 'أخضر'] },
  { id: 'h2', name: 'مبخرة خزفية مزخرفة', price: 48, category: 'home' },
]

/**
 * كتالوج أكواد الخصم المتاحة في هذا المتجر — يقوم مقام
 * `POST /discounts/validate` في الباكند حتى الربط الفعلي.
 * القيم مطابقة لخصومات لوحة التاجر التجريبية.
 */
export const STORE_DISCOUNT_CODES: readonly DiscountRule[] = [
  { code: 'WELCOME10', type: 'fixed', value: 10, minOrderAmount: 50, usageLimit: 100, usedCount: 14, isActive: true },
  { code: 'MID5', type: 'fixed', value: 5, minOrderAmount: 30, usedCount: 6, isActive: true },
  { code: 'SCHOOL20', type: 'percentage', value: 20, minOrderAmount: 40, maxDiscountAmount: 25, usedCount: 0, isActive: true },
  { code: 'EID15', type: 'percentage', value: 15, minOrderAmount: 80, maxDiscountAmount: 40, usageLimit: 50, usedCount: 32, isActive: true, expired: true },
  { code: 'WEEKEND7', type: 'fixed', value: 7, minOrderAmount: 35, usedCount: 11, isActive: false },
  { code: 'LOYAL12', type: 'fixed', value: 12, minOrderAmount: 60, usageLimit: 20, usedCount: 20, isActive: true },
]
