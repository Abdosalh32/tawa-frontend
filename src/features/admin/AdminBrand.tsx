import './admin.css'

/** هوية لوحة الإدارة أعلى القائمة الجانبية (برومت 16) */
export function AdminBrand() {
  return (
    <div className="admin-brand">
      <span className="admin-brand__mark" aria-hidden="true">ت</span>
      <span className="admin-brand__text">
        <span className="admin-brand__name">توا</span>
        <span className="admin-brand__sub">إدارة المنصة</span>
      </span>
    </div>
  )
}
