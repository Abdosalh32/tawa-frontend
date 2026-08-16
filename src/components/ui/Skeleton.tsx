import type { CSSProperties } from 'react'
import { cx } from './cx'

export interface SkeletonProps {
  /** text: سطر نص · rect: بطاقة/صورة · circle: Avatar */
  variant?: 'text' | 'rect' | 'circle'
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  className?: string
}

/** هيكل تحميل يطابق تخطيط المحتوى القادم — مخفي عن القارئات */
export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return <span className={cx('tw-skeleton', `tw-skeleton--${variant}`, className)} style={{ width, height }} aria-hidden="true" />
}
