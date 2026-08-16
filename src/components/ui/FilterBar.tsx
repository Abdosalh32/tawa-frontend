import type { ReactNode } from 'react'

export interface FilterBarProps {
  /** حقل البحث (SearchField عادة) — يتمدد */
  search?: ReactNode
  /** فلاتر عامة (Select، Chips…) — بلا فلاتر خاصة بمنتج بعينه */
  filters?: ReactNode
  /** أزرار جهة نهاية الشريط (تبديل عرض، تصدير…) */
  actions?: ReactNode
}

/** حاوية شريط الأدوات الموحد فوق القوائم والجداول */
export function FilterBar({ search, filters, actions }: FilterBarProps) {
  return (
    <div className="tw-filterbar">
      {search && <div className="tw-filterbar__search">{search}</div>}
      {filters && <div className="tw-filterbar__filters">{filters}</div>}
      {actions && <div className="tw-filterbar__actions">{actions}</div>}
    </div>
  )
}
