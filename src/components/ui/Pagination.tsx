import { Button } from './Button'

export interface PaginationProps {
  /** الصفحة الحالية (تبدأ من 1) */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
  label?: string
}

/** نافذة أرقام الصفحات: الطرفان + جوار الصفحة الحالية، مع فواصل */
function pageWindow(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const wanted = new Set([1, 2, page - 1, page, page + 1, pageCount - 1, pageCount])
  const pages = Array.from(wanted)
    .filter((n) => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b)

  const result: Array<number | 'gap'> = []
  let previous = 0
  for (const n of pages) {
    if (previous && n - previous > 1) result.push('gap')
    result.push(n)
    previous = n
  }
  return result
}

/**
 * ترقيم صفحات بأرقام غربية وتسميات عربية.
 * في الهاتف تُخفى الأرقام ويبقى «السابق/التالي» ونص الموضع.
 */
export function Pagination({ page, pageCount, onPageChange, disabled = false, label = 'ترقيم الصفحات' }: PaginationProps) {
  if (pageCount < 1) return null

  return (
    <nav className="tw-pagination" aria-label={label}>
      <Button variant="secondary" size="sm" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
        السابق
      </Button>

      <ul className="tw-pagination__pages">
        {pageWindow(page, pageCount).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="tw-pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="tw-page-btn"
                aria-label={`الصفحة ${item}`}
                aria-current={item === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <p className="tw-pagination__info">
        الصفحة <span className="numeric">{page}</span> من <span className="numeric">{pageCount}</span>
      </p>

      <Button variant="secondary" size="sm" disabled={disabled || page >= pageCount} onClick={() => onPageChange(page + 1)}>
        التالي
      </Button>
    </nav>
  )
}
