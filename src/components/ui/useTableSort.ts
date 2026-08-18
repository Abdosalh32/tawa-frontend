import { useState } from 'react'
import type { SortDirection } from './Table'

export interface TableSort {
  key: string
  direction: SortDirection
}

/**
 * فرز محلي للجداول (نمط shadcn: تصاعدي ← تنازلي ← بلا فرز):
 * تُمرَّر دوال القيمة لكل عمود قابل للفرز، والخطاف يدير الحالة ويرتب الصفوف.
 * الأرقام تُقارن رقمياً والنصوص عربياً (`localeCompare('ar')`).
 * يُستبدل بفرز خادمي عند ربط الـ API دون تغيير واجهة الشاشات.
 */
export function useTableSort<T>(sorters: Readonly<Record<string, (row: T) => number | string>>) {
  const [sort, setSort] = useState<TableSort | null>(null)

  const onSortChange = (key: string) => {
    if (!sorters[key]) return
    setSort((prev) =>
      prev?.key !== key ? { key, direction: 'asc' } : prev.direction === 'asc' ? { key, direction: 'desc' } : null,
    )
  }

  const sortRows = (rows: readonly T[]): readonly T[] => {
    if (!sort) return rows
    const value = sorters[sort.key]
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      const compared =
        typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'ar')
      return compared * factor
    })
  }

  return { sort: sort ?? undefined, onSortChange, sortRows }
}
