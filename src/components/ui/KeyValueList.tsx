import type { ReactNode } from 'react'
import { cx } from './cx'

export interface KeyValueItem {
  label: string
  value: ReactNode
  /** قيمة LTR (هاتف، بريد، نطاق) — تُعزل اتجاهياً */
  ltr?: boolean
  /** مبلغ/كود بأرقام ثابتة العرض (يتضمن عزل LTR) */
  numeric?: boolean
}

export interface KeyValueListProps {
  items: KeyValueItem[]
}

/** قائمة مفتاح-قيمة لتفاصيل الطلبات وشاشات المراجعة الإدارية */
export function KeyValueList({ items }: KeyValueListProps) {
  return (
    <dl className="tw-kv">
      {items.map((item) => (
        <div className="tw-kv__row" key={item.label}>
          <dt>{item.label}</dt>
          <dd className={cx(item.numeric && 'numeric', !item.numeric && item.ltr && 'ltr')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
