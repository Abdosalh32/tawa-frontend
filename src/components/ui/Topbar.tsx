import type { ReactNode } from 'react'

export interface TopbarProps {
  /** عنوان السياق الحالي */
  title: string
  /**
   * Placeholder سياق المتجر (اسم + نطاق) — عرض فقط.
   * مبدّل المتاجر غير موجود عمداً (Pending product decision — D5).
   */
  storeContext?: ReactNode
  /** أزرار سياقية (بحث شامل، إجراء أساسي…) */
  actions?: ReactNode
  /**
   * Placeholder قائمة المستخدم — الافتراضي Avatar بالحرف الأول من userName.
   * جرس الإشعارات غائب عمداً (Pending product decision — D7).
   */
  userMenu?: ReactNode
  userName?: string
}

export function Topbar({ title, storeContext, actions, userMenu, userName }: TopbarProps) {
  return (
    <div className="tw-topbar">
      <p className="tw-topbar__title">{title}</p>
      {storeContext && <span className="tw-topbar__store">{storeContext}</span>}
      <span className="tw-topbar__spacer" />
      {actions}
      {userMenu ??
        (userName && (
          <button type="button" className="tw-avatar" aria-label={`قائمة المستخدم — ${userName}`} title={`قائمة المستخدم — ${userName}`}>
            {userName.trim().charAt(0)}
          </button>
        ))}
    </div>
  )
}
