export interface BreadcrumbItem {
  label: string
  /** الانتقال — البند الأخير هو الصفحة الحالية ولا يُنقر */
  onSelect?: () => void
}

export interface BreadcrumbsProps {
  /** بالترتيب من الجذر إلى الصفحة الحالية — يُعرض RTL تلقائياً */
  items: BreadcrumbItem[]
  label?: string
}

export function Breadcrumbs({ items, label = 'مسار التنقل' }: BreadcrumbsProps) {
  return (
    <nav className="tw-breadcrumbs" aria-label={label}>
      <ol>
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`}>
              {isCurrent ? (
                <span aria-current="page">{item.label}</span>
              ) : item.onSelect ? (
                <button type="button" className="tw-breadcrumbs__link" onClick={item.onSelect}>
                  {item.label}
                </button>
              ) : (
                <span className="tw-breadcrumbs__link">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
