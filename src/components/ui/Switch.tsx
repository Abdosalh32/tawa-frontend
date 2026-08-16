export interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * مفتاح تبديل فوري (بلا حفظ). زر بدور switch — التسمية جزء من محتواه،
 * وموضع «التشغيل» جهة نهاية السطر (اليسار في RTL) بحسب الأسس.
 */
export function Switch({ label, checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="tw-switch"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="tw-switch__track" aria-hidden="true">
        <span className="tw-switch__thumb" />
      </span>
      <span className="tw-switch__label">{label}</span>
    </button>
  )
}
