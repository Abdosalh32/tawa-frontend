import { cloneElement, useId } from 'react'
import type { ReactElement } from 'react'

export interface TooltipProps {
  /** نص الشرح الموجز — لا يحمل معلومة لا بديل عنها في اللمس */
  label: string
  /** عنصر تفاعلي واحد قابل للتركيز (يظهر التلميح بالإشارة وبالتركيز معاً) */
  children: ReactElement<{ 'aria-describedby'?: string }>
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId()
  return (
    <span className="tw-tooltip-wrap">
      {cloneElement(children, { 'aria-describedby': id })}
      <span className="tw-tooltip" role="tooltip" id={id}>
        {label}
      </span>
    </span>
  )
}
