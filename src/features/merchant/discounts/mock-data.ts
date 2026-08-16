import type { DiscountStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لشاشة «الخصومات» — للعرض والتصفية المحلية فقط،
 * لا تُستورد خارج هذه الميزة.
 * الحقول من 1.5.1 (مبلغ ثابت، فترة سريان، حد أدنى للطلب) وبرومت 8
 * (الاسم، مرات الاستخدام، نشط/منتهٍ) حصراً.
 * لا أكواد كوبونات — غير مذكورة في أي وثيقة، وآلية التطبيق معلّقة (D9).
 */

export interface MerchantDiscount {
  id: string
  name: string
  /** مبلغ ثابت بالدينار (1.5.1) — لا نسب مئوية في المتطلبات */
  amount: number
  /** الحد الأدنى لقيمة الطلب (1.5.1) */
  minOrder: number
  /** فترة السريان نصاً جاهز الصياغة (أرقام غربية) */
  startsAt: string
  endsAt: string
  /** عدد مرات الاستخدام (برومت 8) — رقم عرضي ثابت */
  usageCount: number
  /** الحالة مخزنة مباشرة — التواريخ نصوص عرض لا تُحتسب منها */
  status: DiscountStatus
}

export const MERCHANT_DISCOUNTS: readonly MerchantDiscount[] = [
  { id: 'd1', name: 'خصم افتتاح المتجر', amount: 10, minOrder: 50, startsAt: '1 أغسطس', endsAt: '20 أغسطس', usageCount: 14, status: 'active' },
  { id: 'd2', name: 'عرض منتصف الشهر', amount: 5, minOrder: 30, startsAt: '10 أغسطس', endsAt: '18 أغسطس', usageCount: 6, status: 'active' },
  { id: 'd3', name: 'خصم العيد', amount: 15, minOrder: 80, startsAt: '5 يونيو', endsAt: '12 يونيو', usageCount: 32, status: 'ended' },
  { id: 'd4', name: 'عرض العودة للمدارس', amount: 8, minOrder: 40, startsAt: '25 أغسطس', endsAt: '10 سبتمبر', usageCount: 0, status: 'active' },
  { id: 'd5', name: 'خصم نهاية الأسبوع', amount: 7, minOrder: 35, startsAt: '7 أغسطس', endsAt: '9 أغسطس', usageCount: 11, status: 'ended' },
  { id: 'd6', name: 'عرض رمضان', amount: 20, minOrder: 100, startsAt: '1 مارس', endsAt: '30 مارس', usageCount: 58, status: 'ended' },
  { id: 'd7', name: 'خصم الزبائن الأوفياء', amount: 12, minOrder: 60, startsAt: '12 أغسطس', endsAt: '31 أغسطس', usageCount: 3, status: 'active' },
]
