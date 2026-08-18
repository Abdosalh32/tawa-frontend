import type { ReactNode } from 'react'
import { Button } from './Button'

export type AttentionSeverity = 'critical' | 'warning' | 'info'

export interface AttentionItemData {
  id: string
  severity: AttentionSeverity
  /** ماذا حدث — جملة واحدة محددة بالأسماء */
  title: ReactNode
  /** لماذا يهم — سطر هادئ */
  why?: ReactNode
  /** ماذا أفعل — فعل واحد بصيغة الأمر */
  actionLabel?: string
  onAction?: () => void
}

export interface AttentionListProps {
  items: readonly AttentionItemData[]
  /** حالة «كل شيء تحت السيطرة» حين لا بنود */
  emptyTitle?: string
  emptyDescription?: string
  label?: string
}

/**
 * نمط توا «يحتاج انتباهك» (الاتجاه الفني §9 وتوقيع ٢):
 * سطح واحد بصفوف مفصولة بفواصل داخلية، كل صف يحمل خيط توا بلون خطورته —
 * ماذا حدث / لماذا يهم / ماذا أفعل. لا صناديق تنبيه صاخبة.
 */
export function AttentionList({
  items,
  emptyTitle = 'كل شيء تحت السيطرة',
  emptyDescription = 'لا شيء يحتاج انتباهك الآن.',
  label = 'يحتاج انتباهك',
}: AttentionListProps) {
  if (items.length === 0) {
    return (
      <div className="tw-attn tw-attn--clear" role="status">
        <span className="tw-attn__clear-mark" aria-hidden="true">
          ✓
        </span>
        <span>
          <span className="tw-attn__title">{emptyTitle}</span>
          <span className="tw-attn__why">{emptyDescription}</span>
        </span>
      </div>
    )
  }

  return (
    <ul className="tw-attn" aria-label={label}>
      {items.map((item) => (
        <li className={`tw-attn__item tw-attn__item--${item.severity}`} key={item.id}>
          <span className="tw-attn__text">
            <span className="tw-attn__title">{item.title}</span>
            {item.why && <span className="tw-attn__why">{item.why}</span>}
          </span>
          {item.actionLabel && (
            <Button variant="secondary" size="sm" onClick={item.onAction}>
              {item.actionLabel}
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
