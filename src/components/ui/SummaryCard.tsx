import type { ReactNode } from 'react'
import { cx } from './cx'

export type SummaryTone = 'neutral' | 'positive' | 'warning' | 'negative'

export interface SummaryCardProps {
  label: string
  /** القيمة جاهزة التنسيق من المستهلك (المبالغ داخل .numeric) — المكون لا يحسب شيئاً */
  value: ReactNode
  /**
   * جملة التغيّر/السياق جاهزة الصياغة. اللون ليس حامل المعنى الوحيد —
   * على المستهلك تضمين الاتجاه نصاً («ارتفاع 12%…»)
   */
  change?: string
  tone?: SummaryTone
  icon?: ReactNode
}

/** بطاقة مؤشر للوحات — أربع بطاقات كحد أقصى في الصف */
export function SummaryCard({ label, value, change, tone = 'neutral', icon }: SummaryCardProps) {
  return (
    <div className={cx('tw-summary', `tw-summary--${tone}`)}>
      <div className="tw-summary__head">
        <p className="tw-summary__label">{label}</p>
        {icon && (
          <span className="tw-summary__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <p className="tw-summary__value">{value}</p>
      {change && <p className="tw-summary__change">{change}</p>}
    </div>
  )
}
