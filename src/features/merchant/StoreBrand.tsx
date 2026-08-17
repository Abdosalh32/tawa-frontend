import './merchant.css'
import { useActiveStore } from './store-context'

/** هوية المتجر النشط أعلى القائمة الجانبية (D5: التاجر قد يملك عدة متاجر) */
export function StoreBrand() {
  const store = useActiveStore()
  return (
    <div>
      <p className="merchant-brand__name">{store.name}</p>
      <p className="merchant-brand__domain ltr">{store.subdomain}</p>
    </div>
  )
}
