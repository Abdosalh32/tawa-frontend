import { useNavigate } from 'react-router'
import { Breadcrumbs } from '../../components/ui'
import { useActiveStore } from './store-context'

export interface MerchantCrumb {
  label: string
  /** وجهة داخل صدفة المتجر النشط (`overview`، `products`…) — البند الأخير بدونها */
  to?: string
}

/** فتات خبز التاجر موصولة بالتوجيه — `to` نسبي لصدفة `/merchant/{المتجر النشط}/` */
export function MerchantBreadcrumbs({ items }: { items: MerchantCrumb[] }) {
  const navigate = useNavigate()
  const store = useActiveStore()
  return (
    <Breadcrumbs
      items={items.map((item) => ({
        label: item.label,
        onSelect: item.to !== undefined ? () => navigate(`/merchant/${store.id}/${item.to}`) : undefined,
      }))}
    />
  )
}
