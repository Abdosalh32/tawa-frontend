import './merchant.css'
import { useActiveStore } from './store-context'

/** هوية المتجر النشط أعلى القائمة الجانبية — مرساة القشرة البصرية (D5: متاجر متعددة) */
export function StoreBrand() {
  const store = useActiveStore()
  return (
    <div className="merchant-brand">
      <span className="merchant-brand__mark" aria-hidden="true">
        {store.name.trim().charAt(0)}
      </span>
      <span className="merchant-brand__text">
        <span className="merchant-brand__name">{store.name}</span>
        <span className="merchant-brand__domain ltr">{store.subdomain}</span>
      </span>
    </div>
  )
}
