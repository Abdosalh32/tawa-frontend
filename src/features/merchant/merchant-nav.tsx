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
export function buildMerchantNav(activeKey: MerchantNavKey): SidebarGroup[] {
  const active = (key: MerchantNavKey) => key === activeKey
  return [
    {
      title: 'التشغيل',
      items: [
        { key: 'overview', label: 'نظرة عامة', icon: <HomeGlyph />, active: active('overview') },
        { key: 'orders', label: 'الطلبات', icon: <OrdersGlyph />, count: 8, active: active('orders') },
        { key: 'products', label: 'المنتجات', icon: <TagGlyph />, active: active('products') },
        { key: 'categories', label: 'التصنيفات', icon: <FolderTreeGlyph />, active: active('categories') },
        { key: 'inventory', label: 'المخزون', icon: <LayersGlyph />, count: 3, active: active('inventory') },
        { key: 'discounts', label: 'الخصومات', icon: <PercentGlyph />, active: active('discounts') },
      ],
    },
    {
      title: 'المتجر',
      items: [
        { key: 'appearance', label: 'المظهر والقوالب', icon: <PaletteGlyph />, active: active('appearance') },
        { key: 'team', label: 'فريق العمل', icon: <UsersGlyph />, active: active('team') },
        { key: 'settings', label: 'إعدادات المتجر', icon: <GearGlyph />, active: active('settings') },
      ],
    },
  ]
}
