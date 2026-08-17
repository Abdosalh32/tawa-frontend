import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes, useParams } from 'react-router'
import './styles/preview.css'
import { EmptyState, LoadingState } from './components/ui'
import { cx } from './components/ui/cx'
import { MERCHANT_STORES, setActiveStoreId, useActiveStore } from './features/merchant/store-context'

/*
 * جذر التطبيق — توجيه فعلي بعناوين URL (react-router).
 * كل صدفة تُحمَّل كسولاً في حزمة مستقلة (يعالج تحذير حجم الحزمة الواحدة).
 * مسارات التاجر تحمل معرّف المتجر أسوة بالباكند: /merchant/:storeId/… ← /stores/{id}/…
 */

const MerchantAuth = lazy(() => import('./features/auth/MerchantAuth').then((m) => ({ default: m.MerchantAuth })))
const MerchantStoreSetupWizard = lazy(() => import('./features/merchant/store-setup/MerchantStoreSetupWizard').then((m) => ({ default: m.MerchantStoreSetupWizard })))
const MerchantDashboardOverview = lazy(() => import('./features/merchant/dashboard/MerchantDashboardOverview').then((m) => ({ default: m.MerchantDashboardOverview })))
const MerchantProductsList = lazy(() => import('./features/merchant/products/MerchantProductsList').then((m) => ({ default: m.MerchantProductsList })))
const MerchantProductForm = lazy(() => import('./features/merchant/products/MerchantProductForm').then((m) => ({ default: m.MerchantProductForm })))
const MerchantCategoriesList = lazy(() => import('./features/merchant/categories/MerchantCategoriesList').then((m) => ({ default: m.MerchantCategoriesList })))
const MerchantInventoryList = lazy(() => import('./features/merchant/inventory/MerchantInventoryList').then((m) => ({ default: m.MerchantInventoryList })))
const MerchantOrdersList = lazy(() => import('./features/merchant/orders/MerchantOrdersList').then((m) => ({ default: m.MerchantOrdersList })))
const MerchantOrderDetail = lazy(() => import('./features/merchant/orders/MerchantOrderDetail').then((m) => ({ default: m.MerchantOrderDetail })))
const MerchantDiscountsList = lazy(() => import('./features/merchant/discounts/MerchantDiscountsList').then((m) => ({ default: m.MerchantDiscountsList })))
const MerchantAppearance = lazy(() => import('./features/merchant/appearance/MerchantAppearance').then((m) => ({ default: m.MerchantAppearance })))
const MerchantTeam = lazy(() => import('./features/merchant/team/MerchantTeam').then((m) => ({ default: m.MerchantTeam })))
const MerchantStoreSettings = lazy(() => import('./features/merchant/store-settings/MerchantStoreSettings').then((m) => ({ default: m.MerchantStoreSettings })))
const CustomerStorefrontBrowse = lazy(() => import('./features/customer/storefront/CustomerStorefrontBrowse').then((m) => ({ default: m.CustomerStorefrontBrowse })))
const CustomerProductDetail = lazy(() => import('./features/customer/product-detail/CustomerProductDetail').then((m) => ({ default: m.CustomerProductDetail })))
const CustomerCart = lazy(() => import('./features/customer/cart/CustomerCart').then((m) => ({ default: m.CustomerCart })))
const CustomerCheckout = lazy(() => import('./features/customer/checkout/CustomerCheckout').then((m) => ({ default: m.CustomerCheckout })))
const CustomerOrderTracking = lazy(() => import('./features/customer/order-tracking/CustomerOrderTracking').then((m) => ({ default: m.CustomerOrderTracking })))
const AdminDashboard = lazy(() => import('./features/admin/dashboard/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminApprovals = lazy(() => import('./features/admin/approvals/AdminApprovals').then((m) => ({ default: m.AdminApprovals })))
const AdminStores = lazy(() => import('./features/admin/stores/AdminStores').then((m) => ({ default: m.AdminStores })))
const AdminModeration = lazy(() => import('./features/admin/moderation/AdminModeration').then((m) => ({ default: m.AdminModeration })))
const AdminPlans = lazy(() => import('./features/admin/plans/AdminPlans').then((m) => ({ default: m.AdminPlans })))
const AdminAudit = lazy(() => import('./features/admin/audit/AdminAudit').then((m) => ({ default: m.AdminAudit })))
const DesignSystemPreview = lazy(() => import('./features/design-system/DesignSystemPreview').then((m) => ({ default: m.DesignSystemPreview })))

/** روابط شريط المعاينة التطويري — التسميات نفسها، لكنها الآن عناوين URL حقيقية */
const DEV_LINKS: ReadonlyArray<{ to: string; label: string; merchant?: boolean }> = [
  { to: '/auth', label: 'المصادقة — دخول وتسجيل' },
  { to: '/setup', label: 'إعداد المتجر (معالج)' },
  { to: 'overview', label: 'لوحة التاجر — نظرة عامة', merchant: true },
  { to: 'products', label: 'لوحة التاجر — المنتجات', merchant: true },
  { to: 'products/new', label: 'لوحة التاجر — نموذج منتج', merchant: true },
  { to: 'categories', label: 'لوحة التاجر — التصنيفات', merchant: true },
  { to: 'inventory', label: 'لوحة التاجر — المخزون', merchant: true },
  { to: 'orders', label: 'لوحة التاجر — الطلبات', merchant: true },
  { to: 'orders/TW-2481-9X', label: 'لوحة التاجر — تفاصيل طلب', merchant: true },
  { to: 'discounts', label: 'لوحة التاجر — الخصومات', merchant: true },
  { to: 'appearance', label: 'لوحة التاجر — المظهر والقوالب', merchant: true },
  { to: 'team', label: 'لوحة التاجر — فريق العمل', merchant: true },
  { to: 'settings', label: 'لوحة التاجر — إعدادات المتجر', merchant: true },
  { to: '/shop', label: 'واجهة الزبون — التصفح' },
  { to: '/shop/products/p1', label: 'واجهة الزبون — صفحة منتج' },
  { to: '/shop/cart', label: 'واجهة الزبون — السلة' },
  { to: '/shop/checkout', label: 'واجهة الزبون — إتمام الشراء' },
  { to: '/shop/tracking', label: 'واجهة الزبون — تتبع الطلب' },
  { to: '/admin', label: 'لوحة المدير — الرئيسية' },
  { to: '/admin/approvals', label: 'لوحة المدير — طلبات الاعتماد' },
  { to: '/admin/stores', label: 'لوحة المدير — المتاجر' },
  { to: '/admin/moderation', label: 'لوحة المدير — فحص المنتجات' },
  { to: '/admin/plans', label: 'لوحة المدير — باقات الاشتراك' },
  { to: '/admin/audit', label: 'لوحة المدير — سجل التدقيق' },
  { to: '/design-system', label: 'معاينة نظام التصميم' },
]

function DevBar() {
  /* روابط التاجر تتبع المتجر النشط كي لا يقفز الشريط بين المتاجر */
  const store = useActiveStore()
  return (
    <div className="dev-bar">
      <span>عرض تطويري:</span>
      {DEV_LINKS.map((item) => (
        <NavLink
          key={item.label}
          to={item.merchant ? `/merchant/${store.id}/${item.to}` : item.to}
          end={item.to === 'products' || item.to === 'orders' || item.to === '/admin' || item.to === '/shop'}
          className={({ isActive }) => cx('tw-btn', 'tw-btn--sm', isActive ? 'tw-btn--primary' : 'tw-btn--secondary')}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

/** غلاف كل الشاشات: شريط المعاينة + المحتوى المتوجَّه */
function DevRootLayout() {
  return (
    <div className="dev-root">
      <DevBar />
      <div className="dev-content">
        <Suspense fallback={<LoadingState label="جارٍ تحميل الشاشة…" />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * مسار المتجر النشط: يزامن `:storeId` من العنوان مع مخزن السياق (D5) —
 * العنوان هو مصدر الحقيقة، ومعرّف مجهول يعيد التوجيه للمتجر الأول.
 */
function MerchantStoreLayout() {
  const { storeId } = useParams()
  const known = MERCHANT_STORES.some((store) => store.id === storeId)

  useEffect(() => {
    if (storeId !== undefined && known) setActiveStoreId(storeId)
  }, [storeId, known])

  if (!known) return <Navigate to={`/merchant/${MERCHANT_STORES[0].id}/overview`} replace />
  return <Outlet />
}

function NotFound() {
  return (
    <div style={{ padding: 'var(--space-3xl)' }}>
      <EmptyState
        title="الصفحة غير موجودة"
        description="تأكد من العنوان — قد يكون الرابط قديماً أو الصفحة نُقلت."
        action={
          <NavLink to="/" className="tw-btn tw-btn--primary">
            العودة للوحة التاجر
          </NavLink>
        }
      />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DevRootLayout />}>
          <Route path="/" element={<Navigate to={`/merchant/${MERCHANT_STORES[0].id}/overview`} replace />} />
          <Route path="/auth" element={<MerchantAuth />} />
          <Route path="/setup" element={<MerchantStoreSetupWizard />} />

          <Route path="/merchant/:storeId" element={<MerchantStoreLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<MerchantDashboardOverview />} />
            <Route path="products" element={<MerchantProductsList />} />
            <Route path="products/new" element={<MerchantProductForm mode="create" />} />
            <Route path="products/:productId/edit" element={<MerchantProductForm mode="edit" />} />
            <Route path="categories" element={<MerchantCategoriesList />} />
            <Route path="inventory" element={<MerchantInventoryList />} />
            <Route path="orders" element={<MerchantOrdersList />} />
            <Route path="orders/:orderId" element={<MerchantOrderDetail />} />
            <Route path="discounts" element={<MerchantDiscountsList />} />
            <Route path="appearance" element={<MerchantAppearance />} />
            <Route path="team" element={<MerchantTeam />} />
            <Route path="settings" element={<MerchantStoreSettings />} />
          </Route>

          <Route path="/shop" element={<CustomerStorefrontBrowse />} />
          <Route path="/shop/products/:productId" element={<CustomerProductDetail />} />
          <Route path="/shop/cart" element={<CustomerCart />} />
          <Route path="/shop/checkout" element={<CustomerCheckout />} />
          <Route path="/shop/tracking" element={<CustomerOrderTracking />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/audit" element={<AdminAudit />} />

          <Route path="/design-system" element={<DesignSystemPreview />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
