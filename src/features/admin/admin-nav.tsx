import type { SidebarGroup } from '../../components/ui'
import { HomeGlyph, LayersGlyph, OrdersGlyph, ScrollGlyph, ShieldGlyph, TagGlyph } from '../../components/ui/icons'

export type AdminNavKey = 'overview' | 'approvals' | 'moderation' | 'stores' | 'plans' | 'audit'

/**
 * ملاحة لوحة مدير المنصة بحسب البنية المعلوماتية الموثقة (information-architecture §3.1).
 * البنود عرضية في هذه المرحلة (لا Routing)، والعدّادات بيانات تجريبية.
 * لا جرس إشعارات (D7) ولا أدوار متعددة للمديرين (M8 غير محسوم).
 */
export function buildAdminNav(activeKey: AdminNavKey, onNavigate?: (key: AdminNavKey) => void): SidebarGroup[] {
  const active = (key: AdminNavKey) => key === activeKey
  const onSelect = onNavigate ? (key: string) => onNavigate(key as AdminNavKey) : undefined
  return [
    {
      title: 'الطوابير',
      items: [
        { key: 'overview', label: 'الرئيسية', icon: <HomeGlyph />, active: active('overview'), onSelect },
        { key: 'approvals', label: 'طلبات الاعتماد', icon: <ShieldGlyph />, count: 5, active: active('approvals'), onSelect },
        { key: 'moderation', label: 'فحص المنتجات', icon: <TagGlyph />, count: 12, active: active('moderation'), onSelect },
      ],
    },
    {
      title: 'الإدارة',
      items: [
        { key: 'stores', label: 'المتاجر', icon: <LayersGlyph />, active: active('stores'), onSelect },
        { key: 'plans', label: 'باقات الاشتراك', icon: <OrdersGlyph />, active: active('plans'), onSelect },
        { key: 'audit', label: 'سجل التدقيق', icon: <ScrollGlyph />, active: active('audit'), onSelect },
      ],
    },
  ]
}
