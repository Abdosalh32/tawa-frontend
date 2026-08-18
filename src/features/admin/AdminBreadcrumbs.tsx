import { useNavigate } from 'react-router'
import { Breadcrumbs } from '../../components/ui'

export interface AdminCrumb {
  label: string
  /** مسار مطلق (`/admin`، `/admin/stores`…) — البند الأخير بدونه */
  to?: string
  /** بديل محلي (تبديل عرض داخل الشاشة نفسها) */
  onSelect?: () => void
}

/** فتات خبز المدير موصولة بالتوجيه */
export function AdminBreadcrumbs({ items }: { items: AdminCrumb[] }) {
  const navigate = useNavigate()
  return (
    <Breadcrumbs
      items={items.map((item) => ({
        label: item.label,
        onSelect: item.to !== undefined ? () => navigate(item.to as string) : item.onSelect,
      }))}
    />
  )
}
