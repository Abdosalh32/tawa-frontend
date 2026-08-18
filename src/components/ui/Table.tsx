import type { ReactNode, TableHTMLAttributes, ThHTMLAttributes } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { cx } from './cx'

export type SortDirection = 'asc' | 'desc'

export interface TableProps extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  /** وصف الجدول للقارئات (caption مخفي بصرياً) */
  caption?: string
  children: ReactNode
}

/** جدول دلالي داخل حاوية تمرير أفقي للشاشات الضيقة */
export function Table({ caption, children, className, ...rest }: TableProps) {
  return (
    <div className="tw-table-wrap">
      <table className={cx('tw-table', className)} {...rest}>
        {caption && <caption className="visually-hidden">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

export interface TableHeaderCellProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'aria-sort'> {
  /** الفرز المحلي عبر useTableSort — أو تحكم خارجي (خادمي) بنفس الواجهة */
  sortable?: boolean
  sortDirection?: SortDirection | null
  onSort?: () => void
}

export function TableHeaderCell({ sortable, sortDirection, onSort, children, ...rest }: TableHeaderCellProps) {
  const ariaSort = sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined

  return (
    <th scope="col" aria-sort={ariaSort} {...rest}>
      {sortable ? (
        <button type="button" className={cx('tw-th-sort', sortDirection != null && 'is-sorted')} onClick={onSort}>
          {children}
          <span className="tw-th-sort__arrow" aria-hidden="true">
            {sortDirection === 'asc' ? (
              <ChevronUp size={14} strokeWidth={2} />
            ) : sortDirection === 'desc' ? (
              <ChevronDown size={14} strokeWidth={2} />
            ) : (
              <ChevronsUpDown size={14} strokeWidth={2} />
            )}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  )
}
