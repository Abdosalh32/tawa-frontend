import { useEffect, useId, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { IconButton } from './IconButton'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** صف الأزرار — الأساسي جهة اليسار في RTL */
  footer?: ReactNode
  /** false للقرارات الخطرة: لا إغلاق بنقر الخلفية */
  dismissOnBackdrop?: boolean
  /** العنصر الذي يستقبل التركيز عند الفتح (افتراضياً: اللوحة نفسها) */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** إخفاء زر الإغلاق في الرأس (تستخدمه حوارات التأكيد) */
  hideCloseButton?: boolean
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * حوار مركزي: يحبس التركيز، يُغلق بـ Esc، يعيد التركيز لمصدره عند الإغلاق،
 * ويمنع تمرير الصفحة خلفه.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  dismissOnBackdrop = true,
  initialFocusRef,
  hideCloseButton = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const initialTarget = initialFocusRef?.current ?? panel
    initialTarget?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose, initialFocusRef])

  if (!open) return null

  return (
    <div
      className="tw-modal-backdrop"
      onMouseDown={(event) => {
        if (dismissOnBackdrop && event.target === event.currentTarget) onClose()
      }}
    >
      <div className="tw-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef} tabIndex={-1}>
        <div className="tw-modal__header">
          <h2 className="tw-modal__title" id={titleId}>
            {title}
          </h2>
          {!hideCloseButton && (
            <IconButton label="إغلاق" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </IconButton>
          )}
        </div>
        <div className="tw-modal__body">{children}</div>
        {footer && <div className="tw-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
