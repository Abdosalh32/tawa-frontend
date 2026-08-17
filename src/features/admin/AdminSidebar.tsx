import { useNavigate } from 'react-router'
import { Sidebar } from '../../components/ui'
import { AdminBrand } from './AdminBrand'
import { buildAdminNav } from './admin-nav'
import type { AdminNavKey } from './admin-nav'

const ROUTE_OF: Record<AdminNavKey, string> = {
  overview: '/admin',
  approvals: '/admin/approvals',
  moderation: '/admin/moderation',
  stores: '/admin/stores',
  plans: '/admin/plans',
  audit: '/admin/audit',
}

/** القائمة الجانبية للمدير موصولة بالتوجيه الفعلي */
export function AdminSidebar({ active }: { active: AdminNavKey }) {
  const navigate = useNavigate()
  return <Sidebar brand={<AdminBrand />} groups={buildAdminNav(active, (key) => navigate(ROUTE_OF[key]))} />
}
