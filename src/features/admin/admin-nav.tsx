import type { SidebarGroup } from '../../components/ui'
import { HomeGlyph, LayersGlyph, OrdersGlyph, ScrollGlyph, ShieldGlyph, TagGlyph } from '../../components/ui/icons'

export type AdminNavKey = 'overview' | 'approvals' | 'moderation' | 'stores' | 'plans' | 'audit'

/**
 * ملاحة لوحة مدير المنصة بحسب البنية المعلوماتية الموثقة (information-architecture §3.1).
 * البنود عرضية في هذه المرحلة (لا Routing)، والعدّادات بيانات تجريبية.
 * لا جرس إشعارات (D7) ولا أدوار متعددة للمديرين (M8 غير محسوم).
 */
export function buildAdminNav(activeKey: AdminNavKey): SidebarGroup[] {
  const active = (key: AdminNavKey) => key === activeKey
  return [
    {
      title: 'الطوابير',
      items: [
        { key: 'overview', label: 'الرئيسية', icon: <HomeGlyph />, active: active('overview') },
        { key: 'approvals', label: 'طلبات الاعتماد', icon: <ShieldGlyph />, count: 5, active: active('approvals') },
        { key: 'moderation', label: 'فحص المنتجات', icon: <TagGlyph />, count: 12, active: active('moderation') },
      ],
    },
    {
      title: 'الإدارة',
      items: [
        { key: 'stores', label: 'المتاجر', icon: <LayersGlyph />, active: active('stores') },
        { key: 'plans', label: 'باقات الاشتراك', icon: <OrdersGlyph />, active: active('plans') },
        { key: 'audit', label: 'سجل التدقيق', icon: <ScrollGlyph />, active: active('audit') },
      ],
    },
  ]
}
