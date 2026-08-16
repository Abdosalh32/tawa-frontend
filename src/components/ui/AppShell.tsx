import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IconButton } from './IconButton'
import { cx } from './cx'

/**
 * merchant: أزرق المنصة · admin: البنفسجي الإداري (إعادة توجيه أدوار accent)
 * storefront: يبقى على الافتراضي — صبغه بلون التاجر معلّق على قرار D6
 */
export type ShellContext = 'merchant' | 'admin' | 'storefront'

export interface AppShellProps {
  context: ShellContext
  /** محتوى القائمة الجانبية (Sidebar عادةً) — يُغفل في الستورفرونت */
  sidebar?: ReactNode
  /** محتوى الشريط العلوي (Topbar عادةً) */
  topbar?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * هيكل التطبيق: قائمة جانبية مكتبية تتحول درجاً في الشاشات الضيقة
 * (Container queries — يستجيب لعرض حاويته لا لعرض النافذة، فيصح داخل
 * إطارات المعاينة وبملء الشاشة معاً).
 * منطقة المحتوى div لا <main> كي لا تتعارض مع معلم الصفحة المضيفة.
 */
export function AppShell({ context, sidebar, topbar, children, className }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!drawerOpen) return
    drawerCloseRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen])

  return (
    <div className={cx('tw-shell', className)} data-context={context}>
      {sidebar && <aside className="tw-shell__sidebar">{sidebar}</aside>}

      <div className="tw-shell__main">
        <header className="tw-shell__topbar">
          {sidebar && (
            <IconButton label="فتح قائمة التنقل" className="tw-shell__menu-btn" onClick={() => setDrawerOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 4h14M2 9h14M2 14h14" />
              </svg>
            </IconButton>
          )}
          {topbar}
        </header>
        <div className="tw-shell__content">{children}</div>
      </div>

      {drawerOpen && sidebar && (
        <div
          className="tw-shell__scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDrawerOpen(false)
          }}
        >
          <div className="tw-shell__drawer" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
            <div className="tw-shell__drawer-head">
              <IconButton ref={drawerCloseRef} label="إغلاق قائمة التنقل" onClick={() => setDrawerOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </IconButton>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  )
}
