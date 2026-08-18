import type { ReactNode } from 'react'
import { cx } from './cx'
import type { BadgeVariant } from './Badge'

export interface StatusTextProps {
  variant?: BadgeVariant
  children: ReactNode
}

/**
 * «نقطة الحالة» (توقيع ٥ في الاتجاه الفني): نقطة ملونة + نص هادئ بلا كبسولة.
 * للحالات الثانوية في الجداول (الدفع، التجهيز…) — الكبسولة الممتلئة (Badge)
 * تُحجز لحالة واحدة أساسية في الصف كي يستعيد اللون معناه.
 */
export function StatusText({ variant = 'neutral', children }: StatusTextProps) {
  return (
    <span className={cx('tw-statustext', `tw-statustext--${variant}`)}>
      <span className="tw-statustext__dot" aria-hidden="true" />
      {children}
    </span>
  )
}
