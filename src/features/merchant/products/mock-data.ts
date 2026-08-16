import type { ProductStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «المنتجات» — للعرض والتصفية المحلية فقط.
 * لا تمثل بيانات فعلية ولا تُستورد خارج هذه الميزة.
 * الحقول من نموذج المنتج الموثق فقط (1.4.x + برومت 4): لا فئات ولا تسعير هنا.
 */

export interface MerchantProduct {
  id: string
  name: string
  /** رمز المنتج — لاتيني LTR دائماً */
  sku: string
  /** 0 = منتج بلا متغيرات (1.4.6) */
  variantCount: number
  /** المتاح للبيع = الكمية − المحجوز (1.4.9) */
  available: number
  status: ProductStatus
  /** نص تاريخ جاهز الصياغة (أرقام غربية) */
  updatedAt: string
}

export const MERCHANT_PRODUCTS: readonly MerchantProduct[] = [
  { id: 'p1', name: 'شامبو أرغان 400مل', sku: 'SH-ARG-400', variantCount: 0, available: 3, status: 'published', updatedAt: 'اليوم، 9:40 ص' },
  { id: 'p2', name: 'قميص قطني رجالي', sku: 'TS-CTN-M', variantCount: 4, available: 26, status: 'published', updatedAt: 'أمس' },
  { id: 'p3', name: 'كريم زبدة الشيا', sku: 'CR-SHEA', variantCount: 2, available: 2, status: 'published', updatedAt: 'أمس' },
  { id: 'p4', name: 'عطر العود الملكي 50مل', sku: 'PF-OUD-50', variantCount: 2, available: 0, status: 'published', updatedAt: '14 أغسطس' },
  { id: 'p5', name: 'سجادة صلاة مخملية', sku: 'RG-VLT-01', variantCount: 3, available: 18, status: 'published', updatedAt: '13 أغسطس' },
  { id: 'p6', name: 'مجموعة عناية بالبشرة', sku: 'SK-SET-01', variantCount: 0, available: 11, status: 'draft', updatedAt: '12 أغسطس' },
  { id: 'p7', name: 'زيت جوز الهند العضوي', sku: 'OL-CCN-250', variantCount: 0, available: 7, status: 'published', updatedAt: '11 أغسطس' },
  { id: 'p8', name: 'شنطة يد جلدية', sku: 'BG-LTH-02', variantCount: 3, available: 5, status: 'draft', updatedAt: '10 أغسطس' },
  { id: 'p9', name: 'مقشر القهوة العربية', sku: 'SC-CFE-01', variantCount: 0, available: 14, status: 'archived', updatedAt: '2 أغسطس' },
]
