import type { ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './cx'

/* أيقونات خطية بسيطة (سمك 2px) للحالات — زخرفية، النص هو حامل المعنى */

function BoxGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8zM4 8l8 4 8-4M12 12v8" />
    </svg>
  )
}

function AlertGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.5" />
    </svg>
  )
}

function LockGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  )
}

interface StateShellProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  error?: boolean
  role?: 'status' | 'alert'
}

function StateShell({ icon, title, description, action, error, role }: StateShellProps) {
  return (
    <div className={cx('tw-state', error && 'tw-state--error')} role={role}>
      <span className="tw-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="tw-state__title">{title}</p>
      {description && <p className="tw-state__description">{description}</p>}
      {action && <div className="tw-state__action">{action}</div>}
    </div>
  )
}

/* ─────────────────────────────────────────── */

export interface EmptyStateProps {
  title: string
  description?: string
  /** زر الإجراء الأول («+ منتج جديد») أو «مسح الفلاتر» للفارغة-بفلتر */
  action?: ReactNode
  icon?: ReactNode
}

/** الحالة الفارغة الثلاثية: رسم + جملة + إجراء البدء */
export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return <StateShell icon={icon ?? <BoxGlyph />} title={title} description={description} action={action} />
}

export interface LoadingStateProps {
  label?: string
}

/** تحميل مُعلن للقارئات — للمناطق التي لا يناسبها Skeleton */
export function LoadingState({ label = 'جارٍ التحميل…' }: LoadingStateProps) {
  return (
    <div className="tw-state" role="status">
      <span className="tw-spinner" style={{ width: 28, height: 28, color: 'var(--accent)' }} aria-hidden="true" />
      <p className="tw-state__description">{label}</p>
    </div>
  )
}

export interface ErrorStateProps {
  title?: string
  description?: string
  /** يعرض زر «إعادة المحاولة» عند تمريره */
  onRetry?: () => void
}

/** خطأ داخل حدود المنطقة الفاشلة: ما حدث + ما العمل + إعادة المحاولة */
export function ErrorState({
  title = 'تعذّر تحميل البيانات',
  description = 'حدث خطأ غير متوقع — أعد المحاولة، وإن تكرر الخطأ تواصل مع الدعم.',
  onRetry,
}: ErrorStateProps) {
  return (
    <StateShell
      icon={<AlertGlyph />}
      title={title}
      description={description}
      error
      role="alert"
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        )
      }
    />
  )
}

export interface PermissionDeniedStateProps {
  title?: string
  description?: string
}

/** حالة «غير مصرّح» — نبرة محايدة غير اتهامية مع مخرج واضح (1.5.8) */
export function PermissionDeniedState({
  title = 'ليست لديك صلاحية الوصول',
  description = 'هذا القسم خارج صلاحياتك الحالية — تواصل مع مالك المتجر إن كنت تحتاج الوصول إليه.',
}: PermissionDeniedStateProps) {
  return <StateShell icon={<LockGlyph />} title={title} description={description} />
}
