import type { ApprovalStatus } from '../../../types/status'

/**
 * بيانات تجريبية محلية لطلبات الاعتماد (م.1.3.1 – م.1.3.3) — للعرض والقرار المحلي فقط.
 * لا تُستورد خارج هذه الميزة.
 * ملاحظات التزام:
 *  - «الباقة المختارة» غير معروضة: اختيار التاجر لباقته قرار منتج مفقود (M2).
 *  - «حالة الوثائق» غير معروضة كقيمة: سير رفع الوثائق معلّق (D3).
 */

export interface ApprovalRequest {
  id: string
  merchantName: string
  merchantPhone: string
  merchantEmail: string
  /** بيانات المتجر المطلوب (1.2.1) */
  requestedStoreName: string
  requestedCategory: string
  requestedSubdomain: string
  submittedAt: string
  /** عمر الطلب بالأيام — يُبرز التأخير في الطابور (برومت 17) */
  ageDays: number
  status: Extract<ApprovalStatus, 'pending' | 'approved' | 'rejected'>
  /** سبب الرفض المكتوب (م.1.3.3) — للطلبات المرفوضة فقط */
  rejectionReason?: string
}

export const APPROVAL_REQUESTS: readonly ApprovalRequest[] = [
  {
    id: 'r1',
    merchantName: 'جواد بن عيسى',
    merchantPhone: '+218 91 555 1020',
    merchantEmail: 'jawad@example.ly',
    requestedStoreName: 'مكتبة الأندلس',
    requestedCategory: 'كتب وقرطاسية',
    requestedSubdomain: 'andalus.tawa.ly',
    submittedAt: '14 أغسطس، 11:20 ص',
    ageDays: 3,
    status: 'pending',
  },
  {
    id: 'r2',
    merchantName: 'نورية الشريف',
    merchantPhone: '+218 92 604 7788',
    merchantEmail: 'nouria@example.ly',
    requestedStoreName: 'أزياء نورية',
    requestedCategory: 'أزياء',
    requestedSubdomain: 'nouria.tawa.ly',
    submittedAt: '16 أغسطس، 9:05 ص',
    ageDays: 1,
    status: 'pending',
  },
  {
    id: 'r3',
    merchantName: 'عمر الفيتوري',
    merchantPhone: '+218 94 111 3344',
    merchantEmail: 'omar@example.ly',
    requestedStoreName: 'إلكترونيات عمر',
    requestedCategory: 'إلكترونيات',
    requestedSubdomain: 'omar-tech.tawa.ly',
    submittedAt: '17 أغسطس، 8:30 ص',
    ageDays: 0,
    status: 'pending',
  },
  {
    id: 'r4',
    merchantName: 'سعاد بالحاج',
    merchantPhone: '+218 91 220 9911',
    merchantEmail: 'souad@example.ly',
    requestedStoreName: 'حلويات سعاد',
    requestedCategory: 'غذائي',
    requestedSubdomain: 'souad-sweets.tawa.ly',
    submittedAt: '17 أغسطس، 10:15 ص',
    ageDays: 0,
    status: 'pending',
  },
  {
    id: 'r5',
    merchantName: 'مريم الزوي',
    merchantPhone: '+218 92 909 1122',
    merchantEmail: 'mariam@example.ly',
    requestedStoreName: 'ركن الهدايا',
    requestedCategory: 'منزل وديكور',
    requestedSubdomain: 'hadaya.tawa.ly',
    submittedAt: '15 أغسطس، 1:40 م',
    ageDays: 2,
    status: 'pending',
  },
  {
    id: 'r6',
    merchantName: 'خالد المقريف',
    merchantPhone: '+218 94 222 7788',
    merchantEmail: 'khaled@example.ly',
    requestedStoreName: 'عطور الشرق',
    requestedCategory: 'عطور',
    requestedSubdomain: 'sharq.tawa.ly',
    submittedAt: '10 أغسطس، 3:00 م',
    ageDays: 7,
    status: 'rejected',
    rejectionReason: 'وثائق التوثيق غير مكتملة — أرفق السجل التجاري كاملاً وأعد التقديم.',
  },
  {
    id: 'r7',
    merchantName: 'فاطمة إدريس',
    merchantPhone: '+218 91 234 5678',
    merchantEmail: 'fatima@example.ly',
    requestedStoreName: 'متجر العافية',
    requestedCategory: 'عناية شخصية',
    requestedSubdomain: 'alafya.tawa.ly',
    submittedAt: '12 أغسطس، 10:00 ص',
    ageDays: 5,
    status: 'approved',
  },
]
