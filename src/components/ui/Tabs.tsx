import { useRef } from 'react'

export interface TabItem {
  key: string
  label: string
  /** عدّاد اختياري (تبويبات حالات الطلبات…) */
  count?: number
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  /** مفتاح التبويب النشط (مضبوط من الخارج) */
  value: string
  onChange: (key: string) => void
  label?: string
}

/**
 * تبويبات تصفية على مستوى الصفحة. لوحة المفاتيح (RTL):
 * السهم الأيسر → التبويب التالي، الأيمن → السابق، Home/End للطرفين.
 * الاختيار يتبع التركيز، وتنزلق أفقياً في الشاشات الضيقة.
 */
export function Tabs({ items, value, onChange, label = 'تبويبات المحتوى' }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const moveFocus = (fromIndex: number, step: 1 | -1) => {
    const enabled = (index: number) => !items[index]?.disabled
    let next = fromIndex
    for (let i = 0; i < items.length; i += 1) {
      next = (next + step + items.length) % items.length
      if (enabled(next)) break
    }
    const item = items[next]
    if (!item || item.disabled) return
    tabRefs.current[next]?.focus()
    onChange(item.key)
  }

  const focusEdge = (edge: 'first' | 'last') => {
    const indexes = items.map((_, i) => i).filter((i) => !items[i]?.disabled)
    const target = edge === 'first' ? indexes[0] : indexes[indexes.length - 1]
    if (target === undefined) return
    const item = items[target]
    if (!item) return
    tabRefs.current[target]?.focus()
    onChange(item.key)
  }

  return (
    <div className="tw-tabs" role="tablist" aria-label={label}>
      {items.map((item, index) => {
        const selected = item.key === value
        return (
          <button
            key={item.key}
            ref={(element) => {
              tabRefs.current[index] = element
            }}
            type="button"
            role="tab"
            className="tw-tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => {
              // RTL: «التالي» بصرياً جهة اليسار = ArrowLeft
              if (event.key === 'ArrowLeft') {
                event.preventDefault()
                moveFocus(index, 1)
              } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                moveFocus(index, -1)
              } else if (event.key === 'Home') {
                event.preventDefault()
                focusEdge('first')
              } else if (event.key === 'End') {
                event.preventDefault()
                focusEdge('last')
              }
            }}
          >
            {item.label}
            {typeof item.count === 'number' && <span className="tw-tab__count">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
