import type { CSSProperties, ReactNode } from 'react'
import { useNavigate } from 'react-router'
import './storefront.css'
import { Radio } from '../../../components/ui'
import { TEMPLATES, deriveSurface, readableOn } from '../../../types/store-theme'
import { BRAND_PRESETS, cartQuantityOf, presetOf, setPreviewConfig, useStorePreviewConfig } from './preview-config'

export interface StorefrontShellProps {
  /** أدوات حالة الشاشة الخاصة (fieldset تطويري) */
  devStateControls?: ReactNode
  /** منطقة منتصف الهيدر (حقل البحث عادة) */
  headerMiddle?: ReactNode
  children: ReactNode
}

/**
 * قشرة الستورفرونت الموحدة: ثيم التاجر (قالب + ألوان من مخزن المعاينة المشترك)
 * + هيدر برومت 12 (شعار، بحث، تتبع، سلة بعدّاد غير موصولة) + فوتر —
 * تستهلكها شاشتا التصفح وتفاصيل المنتج دون تكرار.
 */
export function StorefrontShell({ devStateControls, headerMiddle, children }: StorefrontShellProps) {
  const navigate = useNavigate()
  const config = useStorePreviewConfig()
  const { template, presetKey } = config
  const cartCount = cartQuantityOf(config)
  const preset = presetOf(presetKey)
  const onPrimary = readableOn(preset.colors.primary)

  /* الأدوار الستة من العقد + قيمتان مشتقتان محلياً: سطح البطاقات ونصوص الترويسة/التذييل */
  const themeStyle = {
    '--sf-primary': preset.colors.primary,
    '--sf-secondary': preset.colors.secondary,
    '--sf-background': preset.colors.background,
    '--sf-surface': deriveSurface(preset.colors.background),
    '--sf-text': preset.colors.text_color,
    '--sf-header-bg': preset.colors.header_bg,
    '--sf-footer-bg': preset.colors.footer_bg,
    '--sf-on-primary': onPrimary,
    '--sf-on-header': readableOn(preset.colors.header_bg, preset.colors.background),
    '--sf-on-footer': readableOn(preset.colors.footer_bg, preset.colors.background),
  } as CSSProperties

  return (
    <div className={`sf-root sf-root--${template}`} style={themeStyle} dir="rtl">
      <div className="sf-dev">
        {devStateControls}
        <fieldset className="dev-fieldset" style={{ marginBlockStart: 'var(--space-sm)' }}>
          <legend>محاكاة إعدادات التاجر (قالب وألوان مشتركة بين شاشات الزبون — لا استمرارية بعد)</legend>
          <div className="dev-fieldset__options">
            {TEMPLATES.map((item) => (
              <Radio
                key={item.key}
                name="sf-template"
                label={`قالب ${item.name}`}
                checked={template === item.key}
                onChange={() => setPreviewConfig({ template: item.key })}
              />
            ))}
            {BRAND_PRESETS.map((item) => (
              <Radio
                key={item.key}
                name="sf-preset"
                label={item.label}
                checked={presetKey === item.key}
                onChange={() => setPreviewConfig({ presetKey: item.key })}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <header className="sf-header">
        <button type="button" className="sf-brand" onClick={() => navigate('/shop')}>
          {/* الشعار Placeholder — رفع الشعار الفعلي مؤجل */}
          <span className="sf-brand__logo" aria-hidden="true">
            ع
          </span>
          متجر العافية
        </button>
        {headerMiddle && <div className="sf-header__search">{headerMiddle}</div>}
        <div className="sf-header__actions">
          <button type="button" className="sf-track" onClick={() => navigate('/shop/tracking')}>
            تتبع طلبي
          </button>
          <button
            type="button"
            className="sf-cart"
            aria-label={`السلة — ${cartCount} عناصر`}
            onClick={() => navigate('/shop/cart')}
          >
            السلة (<span className="numeric">{cartCount}</span>)
          </button>
        </div>
      </header>

      {children}

      <footer className="sf-footer">
        <div className="sf-footer__links">
          <button type="button" className="sf-footer__link">
            سياسة الاسترجاع
          </button>
          <button type="button" className="sf-footer__link">
            تواصل معنا
          </button>
        </div>
        <span className="sf-footer__tawa">متجر مرخّص على منصة توا</span>
      </footer>
    </div>
  )
}
