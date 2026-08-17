import './merchant.css'
import { Badge, Menu, MenuItem, MenuSeparator } from '../../components/ui'
import { STORE_STATUS } from '../../types/status'
import { MERCHANT_STORES, setActiveStoreId, useActiveStore } from './store-context'

function ChevronGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5l3 3 3-3" />
    </svg>
  )
}

/**
 * مبدّل المتاجر في الشريط العلوي — يفعّله قرار D5 (متاجر متعددة لكل تاجر).
 * تغيير المتجر يغيّر سياق كل شاشات التاجر (يقابل `{id}` في مسارات الـ API).
 */
export function StoreSwitcher() {
  const active = useActiveStore()

  return (
    <Menu
      label={`المتجر النشط: ${active.name} — تبديل المتجر`}
      className="merchant-switcher"
      trigger={
        <>
          <span className="merchant-switcher__name">{active.name}</span>
          <span className="merchant-switcher__domain ltr">{active.subdomain}</span>
          <ChevronGlyph />
        </>
      }
    >
      {MERCHANT_STORES.map((store) => (
        <MenuItem key={store.id} active={store.id === active.id} onSelect={() => setActiveStoreId(store.id)}>
          <span className="merchant-switcher__option">
            <span>{store.name}</span>
            <span className="merchant-switcher__domain ltr">{store.subdomain}</span>
          </span>
          <Badge variant={STORE_STATUS[store.status].variant}>{STORE_STATUS[store.status].label}</Badge>
        </MenuItem>
      ))}
      <MenuSeparator />
      <MenuItem>+ متجر جديد</MenuItem>
    </Menu>
  )
}
