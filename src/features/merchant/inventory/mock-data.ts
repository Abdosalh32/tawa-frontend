/**
 * بيانات تجريبية محلية لشاشة «المخزون» — للعرض والتصفية المحلية فقط،
 * لا تُستورد خارج هذه الميزة. الصفوف على مستوى المتغير حيث وُجد
 * (المخزون يُتتبع لكل متغير مستقلاً — 1.4.7)، ومتسقة مع بيانات الشاشات السابقة.
 */

export interface InventoryRow {
  id: string
  product: string
  /** تركيبة المتغير («M / أزرق») — غائبة للمنتج بلا متغيرات */
  variant?: string
  sku: string
  /** الكمية الكلية */
  total: number
  /** المحجوز مؤقتاً 15 دقيقة لسلات نشطة (1.4.11) */
  reserved: number
  /** حد تنبيه الانخفاض (1.4.12) — دلالته النهائية معلّقة على G4 */
  threshold: number
}

/** المتاح للبيع = الكلي − المحجوز (1.4.9) */
export function availableOf(row: InventoryRow): number {
  return Math.max(0, row.total - row.reserved)
}

export type InventoryDerivedStatus = 'available' | 'low' | 'out'

export function statusOf(row: InventoryRow): InventoryDerivedStatus {
  const available = availableOf(row)
  if (available === 0) return 'out'
  if (available <= row.threshold) return 'low'
  return 'available'
}

export const INVENTORY_ROWS: readonly InventoryRow[] = [
  { id: 'i1', product: 'شامبو أرغان 400مل', sku: 'SH-ARG-400', total: 5, reserved: 2, threshold: 5 },
  { id: 'i2', product: 'قميص قطني رجالي', variant: 'S / أزرق', sku: 'TS-CTN-S-BL', total: 4, reserved: 0, threshold: 3 },
  { id: 'i3', product: 'قميص قطني رجالي', variant: 'M / أزرق', sku: 'TS-CTN-M-BL', total: 8, reserved: 2, threshold: 3 },
  { id: 'i4', product: 'قميص قطني رجالي', variant: 'M / أبيض', sku: 'TS-CTN-M-WH', total: 5, reserved: 0, threshold: 3 },
  { id: 'i5', product: 'قميص قطني رجالي', variant: 'L / أزرق', sku: 'TS-CTN-L-BL', total: 3, reserved: 1, threshold: 3 },
  { id: 'i6', product: 'كريم زبدة الشيا', variant: 'حجم متوسط', sku: 'CR-SHEA-M', total: 3, reserved: 1, threshold: 4 },
  { id: 'i7', product: 'كريم زبدة الشيا', variant: 'حجم كبير', sku: 'CR-SHEA-L', total: 9, reserved: 0, threshold: 4 },
  { id: 'i8', product: 'عطر العود الملكي 50مل', variant: 'تركيز مضاعف', sku: 'PF-OUD-50X', total: 0, reserved: 0, threshold: 2 },
  { id: 'i9', product: 'سجادة صلاة مخملية', variant: 'أحمر', sku: 'RG-VLT-01-RD', total: 10, reserved: 0, threshold: 4 },
  { id: 'i10', product: 'سجادة صلاة مخملية', variant: 'أخضر', sku: 'RG-VLT-01-GR', total: 8, reserved: 0, threshold: 4 },
  { id: 'i11', product: 'زيت جوز الهند العضوي', sku: 'OL-CCN-250', total: 7, reserved: 0, threshold: 3 },
]
