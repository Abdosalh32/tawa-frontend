import { useSyncExternalStore } from 'react'
import type { StoreStatus } from '../../types/status'

/**
 * سياق المتجر النشط لشاشات التاجر — مخزن محلي في الذاكرة.
 *
 * **قرار D5 محسوم من الباكند (17 أغسطس 2026):** التاجر يملك **متاجر متعددة**
 * (`stores.merchant_id` بلا قيد فرادة · `GET /v1/merchant/stores` يعيد قائمة ·
 * وكل المسارات تحت `/stores/{id}/...`). لذا كل شاشة تاجر تعمل في سياق
 * «المتجر النشط»، وهو ما يقابل `{id}` في نداء الـ API لاحقاً.
 *
 * لا استمرارية ولا Storage — يُستبدل بجلب القائمة من الباكند عند الربط.
 */

export interface MerchantStore {
  id: string
  name: string
  /** النطاق الفرعي الأساسي (store_domains حيث is_primary) */
  subdomain: string
  status: StoreStatus
  /**
   * هل يحمل هذا المتجر بيانات تجريبية في المعاينة؟
   * المتجر الثاني حديث الإنشاء فتظهر شاشاته بحالاتها الفارغة الحقيقية —
   * بدل تكرار مجموعات بيانات وهمية لكل متجر.
   */
  hasSeedData: boolean
}

export const MERCHANT_STORES: readonly MerchantStore[] = [
  { id: 'st-1', name: 'متجر العافية', subdomain: 'alafya.tawa.ly', status: 'active', hasSeedData: true },
  { id: 'st-2', name: 'عطور العافية', subdomain: 'alafya-perfumes.tawa.ly', status: 'draft', hasSeedData: false },
]

let activeStoreId: string = MERCHANT_STORES[0].id
const listeners = new Set<() => void>()

export function setActiveStoreId(id: string): void {
  if (!MERCHANT_STORES.some((store) => store.id === id)) return
  activeStoreId = id
  listeners.forEach((listener) => listener())
}

export function useActiveStore(): MerchantStore {
  const id = useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    () => activeStoreId,
  )
  return MERCHANT_STORES.find((store) => store.id === id) ?? MERCHANT_STORES[0]
}
