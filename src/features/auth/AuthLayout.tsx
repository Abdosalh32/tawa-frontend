import type { ReactNode } from 'react'
import './auth.css'
import { LayersGlyph, OrdersGlyph, TagGlyph } from '../../components/ui/icons'

/**
 * تخطيط المصادقة (برومت 1): بطاقة مركزية 440px، ولوحة ترويجية
 * «أنشئ متجرك في دقائق» بثلاث مزايا تظهر مكتبياً فقط.
 */
export function AuthLayout({ dev, children }: { dev?: ReactNode; children: ReactNode }) {
  return (
    <div className="auth-root">
      {dev && <div className="auth-dev">{dev}</div>}
      <div className="auth-main">
        <aside className="auth-promo" aria-hidden="true">
          <h2 className="auth-promo__title">أنشئ متجرك في دقائق</h2>
          <ul className="auth-features">
            <li className="auth-feature">
              <span className="auth-feature__icon">
                <TagGlyph />
              </span>
              <span className="auth-feature__text">
                <span className="auth-feature__name">متجر جاهز بلا تعقيد</span>
                <span className="auth-feature__hint">منتجات ومتغيرات ومخزون من لوحة واحدة</span>
              </span>
            </li>
            <li className="auth-feature">
              <span className="auth-feature__icon">
                <LayersGlyph />
              </span>
              <span className="auth-feature__text">
                <span className="auth-feature__name">نطاقك الفرعي الخاص</span>
                <span className="auth-feature__hint">
                  مثل <span className="ltr">mystore.tawa.ly</span> — يُحجز فور التسجيل
                </span>
              </span>
            </li>
            <li className="auth-feature">
              <span className="auth-feature__icon">
                <OrdersGlyph />
              </span>
              <span className="auth-feature__text">
                <span className="auth-feature__name">طلبات تصلك فوراً</span>
                <span className="auth-feature__hint">تابع حالاتها من التأكيد حتى التسليم</span>
              </span>
            </li>
          </ul>
        </aside>
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-brand__logo">توا</p>
            <p className="auth-brand__tagline">منصة المتاجر الإلكترونية</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
