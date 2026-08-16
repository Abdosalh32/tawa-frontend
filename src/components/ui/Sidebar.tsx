import type { ReactNode } from 'react'
import { cx } from './cx'

export interface SidebarItem {
  key: string
  label: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  /** شارة عدّ (طلبات جديدة، مخزون منخفض…) — تظهر «+99» حداً أعلى */
  count?: number
  onSelect?: (key: string) => void
}

export interface SidebarGroup {
  title?: string
  items: SidebarItem[]
}

export interface SidebarProps {
  /** منطقة الشعار/هوية المتجر أعلى القائمة */
  brand?: ReactNode
  groups: SidebarGroup[]
  /** بطاقة أسفل القائمة (هوية المستخدم…) */
  footer?: ReactNode
  /** وضع Rail مطوٍ بالأيقونات — كل بند يحتفظ بتسميته العربية للقارئات وTooltip النظام */
  collapsed?: boolean
  label?: string
}

export function Sidebar({ brand, groups, footer, collapsed = false, label = 'التنقل الرئيسي' }: SidebarProps) {
  return (
    <div className={cx('tw-sidebar', collapsed && 'tw-sidebar--collapsed')}>
      {brand && <div className="tw-sidebar__brand">{brand}</div>}
      <nav className="tw-sidebar__nav" aria-label={label}>
        {groups.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`}>
            {group.title && <p className="tw-sidebar__group-title">{group.title}</p>}
            <ul>
              {group.items.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className={cx('tw-side-item', item.active && 'is-active')}
                    aria-current={item.active ? 'page' : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    disabled={item.disabled}
                    onClick={() => item.onSelect?.(item.key)}
                  >
                    {item.icon && (
                      <span className="tw-side-item__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="tw-side-item__label">{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="tw-side-item__count" aria-label={`${item.count} بانتظار المتابعة`}>
                        {item.count > 99 ? '+99' : item.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer && <div className="tw-sidebar__footer">{footer}</div>}
    </div>
  )
}
