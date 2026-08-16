import type { ReactNode } from 'react'
import { EmptyState, ErrorState } from './States'
import { Skeleton } from './Skeleton'
import { Table, TableHeaderCell } from './Table'
import type { SortDirection } from './Table'
import { cx } from './cx'

export interface DataTableColumn<T> {
  key: string
  /** نص الرأس، أو عقدة (نص + تلميح توضيحي…) */
  header: ReactNode
  cell: (row: T) => ReactNode
  /** قيم LTR (مبالغ، أكواد، هواتف) — تُعزل اتجاهياً بأرقام ثابتة العرض */
  numeric?: boolean
  /** حالة بصرية فقط — لا منطق فرز فعلياً في هذه المرحلة */
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: ReadonlyArray<DataTableColumn<T>>
  rows: ReadonlyArray<T>
  /** مفتاح ثابت لكل صف (رقم الطلب، SKU…) */
  rowKey: (row: T) => string
  /** وصف إلزامي للقارئات */
  caption: string
  loading?: boolean
  /** رسالة الخطأ — تعرض ErrorState داخل الجدول */
  error?: string
  onRetry?: () => void
  /** الحالة الفارغة — الافتراضي EmptyState عام */
  emptyState?: ReactNode
  /** حالة الفرز البصرية الحالية */
  sort?: { key: string; direction: SortDirection }
  onSortChange?: (key: string) => void
  /** بنية جاهزة للتحديد — Set مضبوط من الخارج */
  selectable?: boolean
  selectedKeys?: ReadonlySet<string>
  onSelectionChange?: (keys: Set<string>) => void
  /** فئة CSS إضافية للصف (تمييز الصفوف الحرجة بخلفية خافتة…) */
  rowClassName?: (row: T) => string | undefined
}

const SKELETON_ROWS = 5

/** غلاف مُنمّط فوق Table: أعمدة معرّفة، تحميل، فارغ، خطأ، وتحديد صفوف */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  error,
  onRetry,
  emptyState,
  sort,
  onSortChange,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  rowClassName,
}: DataTableProps<T>) {
  const columnCount = columns.length + (selectable ? 1 : 0)
  const selected = selectedKeys ?? new Set<string>()
  const allKeys = rows.map(rowKey)
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selected.has(key))
  const someSelected = allKeys.some((key) => selected.has(key))

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? new Set() : new Set(allKeys))
  }

  const toggleRow = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onSelectionChange?.(next)
  }

  return (
    <Table caption={caption}>
      <thead>
        <tr>
          {selectable && (
            <th scope="col" className="tw-table__check-col">
              <input
                type="checkbox"
                aria-label="تحديد كل الصفوف"
                checked={allSelected}
                disabled={loading || Boolean(error) || rows.length === 0}
                ref={(element) => {
                  if (element) element.indeterminate = someSelected && !allSelected
                }}
                onChange={toggleAll}
              />
            </th>
          )}
          {columns.map((column) => (
            <TableHeaderCell
              key={column.key}
              sortable={column.sortable}
              sortDirection={sort?.key === column.key ? sort.direction : null}
              onSort={() => onSortChange?.(column.key)}
            >
              {column.header}
            </TableHeaderCell>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
            <tr key={`skeleton-${rowIndex}`}>
              {selectable && (
                <td>
                  <Skeleton variant="rect" width={16} height={16} />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key}>
                  <Skeleton variant="text" width={column.numeric ? '56px' : '72%'} />
                </td>
              ))}
            </tr>
          ))
        ) : error ? (
          <tr>
            <td colSpan={columnCount} className="tw-table__state-cell">
              <ErrorState description={error} onRetry={onRetry} />
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={columnCount} className="tw-table__state-cell">
              {emptyState ?? <EmptyState title="لا توجد بيانات لعرضها" />}
            </td>
          </tr>
        ) : (
          rows.map((row) => {
            const key = rowKey(row)
            const isSelected = selected.has(key)
            return (
              <tr key={key} className={cx(isSelected && 'is-selected', rowClassName?.(row))}>
                {selectable && (
                  <td className="tw-table__check-col">
                    <input type="checkbox" aria-label={`تحديد الصف ${key}`} checked={isSelected} onChange={() => toggleRow(key)} />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key}>{column.numeric ? <span className="numeric">{column.cell(row)}</span> : column.cell(row)}</td>
                ))}
              </tr>
            )
          })
        )}
      </tbody>
    </Table>
  )
}
