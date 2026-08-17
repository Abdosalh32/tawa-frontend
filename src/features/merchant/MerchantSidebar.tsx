import { useNavigate } from 'react-router'
import { Sidebar } from '../../components/ui'
import { StoreBrand } from './StoreBrand'
import { buildMerchantNav } from './merchant-nav'
import type { MerchantNavKey } from './merchant-nav'
import { useActiveStore } from './store-context'

/** مسار البند داخل صدفة التاجر — يطابق ذيل مسارات الباكند `/stores/{id}/…` */
const ROUTE_OF: Record<MerchantNavKey, string> = {
  overview: 'overview',
  orders: 'orders',
  products: 'products',
  categories: 'categories',
  inventory: 'inventory',
  discounts: 'discounts',
  appearance: 'appearance',
  team: 'team',
  settings: 'settings',
}

/**
 * القائمة الجانبية للتاجر موصولة بالتوجيه الفعلي:
 * كل بند ينقل إلى `/merchant/{المتجر النشط}/{البند}`.
 */
export function MerchantSidebar({ active }: { active: MerchantNavKey }) {
  const navigate = useNavigate()
  const store = useActiveStore()
  return (
    <Sidebar
      brand={<StoreBrand />}
      groups={buildMerchantNav(active, (key) => navigate(`/merchant/${store.id}/${ROUTE_OF[key]}`))}
    />
  )
}
