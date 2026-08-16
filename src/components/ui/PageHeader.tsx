import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  description?: string
  /** شارات/عدّادات سياقية بجوار العنوان («128 منتجاً»، حالة المتجر…) */
  meta?: ReactNode
  /** الإجراء الأساسي — واحد لكل شاشة */
  primaryAction?: ReactNode
  secondaryActions?: ReactNode
  breadcrumbs?: ReactNode
  /** مستوى العنوان بحسب موضع الاستخدام (h1 للصفحة الكاملة) */
  as?: 'h1' | 'h2' | 'h3'
}

export function PageHeader({ title, description, meta, primaryAction, secondaryActions, breadcrumbs, as: Heading = 'h1' }: PageHeaderProps) {
  return (
    <div className="tw-pagehead-wrap">
      {breadcrumbs}
      <div className="tw-pagehead">
        <div className="tw-pagehead__info">
          <div className="tw-pagehead__title-row">
            <Heading>{title}</Heading>
            {meta}
          </div>
          {description && <p className="tw-pagehead__description">{description}</p>}
        </div>
        {(primaryAction || secondaryActions) && (
          <div className="tw-pagehead__actions">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  )
}
