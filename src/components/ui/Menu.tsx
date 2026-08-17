import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'

export interface MenuProps {
  /** محتوى الزر الذي يفتح القائمة */
  trigger: ReactNode
  /** تسمية وصولية للزر حين لا يكفي محتواه */
  label?: string
  className?: string
  /** عناصر القائمة — تُمرر عبر MenuItem */
  children: ReactNode
}

/**
 * قائمة منسدلة (Popover / قائمة إجراءات — جرد المكونات §10).
 * تُغلق بـ Esc وبالنقر خارجها، وتتنقل بالأسهم، وتتموضع بوعي RTL.
 */
export function Menu({ trigger, label, className, children }: MenuProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        wrapRef.current?.querySelector<HTMLElement>('button')?.focus()
        return
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])
      if (items.length === 0) return
      event.preventDefault()
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length
      items[next]?.focus()
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return (
    <div className={cx('tw-menu', className)} ref={wrapRef}>
      <button
        type="button"
        className="tw-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        {trigger}
      </button>
      {open && (
        <div className="tw-menu__list" role="menu" id={menuId} ref={listRef} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}

export interface MenuItemProps {
  onSelect?: () => void
  /** يميّز العنصر الحالي (aria-current) */
  active?: boolean
  disabled?: boolean
  children: ReactNode
}

export function MenuItem({ onSelect, active, disabled, children }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx('tw-menu__item', active && 'is-active')}
      aria-current={active ? 'true' : undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
    </button>
  )
}

/** فاصل بصري داخل القائمة */
export function MenuSeparator() {
  return <hr className="tw-menu__separator" />
}
