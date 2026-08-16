import { cx } from './cx'

export interface StepperStep {
  key: string
  label: string
}

export interface StepperProps {
  steps: ReadonlyArray<StepperStep>
  /** مفتاح الخطوة الحالية — ما قبلها مكتمل وما بعدها قادم */
  currentKey: string
  label?: string
  /** يطمس المسار كله (طلب ملغى…) مع بقاء النص مقروءاً */
  muted?: boolean
}

/**
 * مؤشر خطوات أفقي للعرض (غير تفاعلي) — مسار حالة الطلب، خطوات المعالجات.
 * المكتمل بعلامة ✓، والحالي بنقطة بارزة و aria-current="step".
 */
export function Stepper({ steps, currentKey, label = 'مسار الحالة', muted = false }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentKey)

  return (
    <ol className={cx('tw-stepper', muted && 'tw-stepper--muted')} aria-label={label}>
      {steps.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
        return (
          <li key={step.key} className={cx('tw-stepper__step', `is-${state}`)} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="tw-stepper__marker" aria-hidden="true">
              {state === 'done' ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1.5 5.5l2.5 2.5 4.5-6" />
                </svg>
              ) : (
                <span className="tw-stepper__dot" />
              )}
            </span>
            <span className="tw-stepper__label">
              {step.label}
              {state === 'done' && <span className="visually-hidden"> (مكتملة)</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
