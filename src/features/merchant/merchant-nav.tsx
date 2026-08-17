import type { SidebarGroup } from '../../components/ui'
import {
  FolderTreeGlyph,
  GearGlyph,
  HomeGlyph,
  LayersGlyph,
  OrdersGlyph,
  PaletteGlyph,
  PercentGlyph,
  TagGlyph,
  UsersGlyph,
} from '../../components/ui/icons'

export type MerchantNavKey =
  | 'overview'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'discounts'
  | 'appearance'
  | 'team'
  | 'settings'

/**
 * ملاحة لوحة التاجر بحسب البنية المعلوماتية الموثقة (information-architecture §1.1).
 * البنود عرضية في هذه المرحلة (لا Routing)، والعدّادات بيانات تجريبية ثابتة.
 * لا جرس إشعارات (D7) ولا مبدّل متاجر (D5) ولا قسم عملاء (لا حسابات زبائن — A2).
 */
export function buildMerchantNav(activeKey: MerchantNavKey, onNavigate?: (key: MerchantNavKey) => void): SidebarGroup[] {
  const active = (key: MerchantNavKey) => key === activeKey
  const onSelect = onNavigate ? (key: string) => onNavigate(key as MerchantNavKey) : undefined
  return [
    {
      title: 'التشغيل',
      items: [
        { key: 'overview', label: 'نظرة عامة', icon: <HomeGlyph />, active: active('overview'), onSelect },
        { key: 'orders', label: 'الطلبات', icon: <OrdersGlyph />, count: 8, active: active('orders'), onSelect },
        { key: 'products', label: 'المنتجات', icon: <TagGlyph />, active: active('products'), onSelect },
        { key: 'categories', label: 'التصنيفات', icon: <FolderTreeGlyph />, active: active('categories'), onSelect },
        { key: 'inventory', label: 'المخزون', icon: <LayersGlyph />, count: 3, active: active('inventory'), onSelect },
        { key: 'discounts', label: 'الخصومات', icon: <PercentGlyph />, active: active('discounts'), onSelect },
      ],
    },
    {
      title: 'المتجر',
      items: [
        { key: 'appearance', label: 'المظهر والقوالب', icon: <PaletteGlyph />, active: active('appearance'), onSelect },
        { key: 'team', label: 'فريق العمل', icon: <UsersGlyph />, active: active('team'), onSelect },
        { key: 'settings', label: 'إعدادات المتجر', icon: <GearGlyph />, active: active('settings'), onSelect },
      ],
    },
  ]
}
