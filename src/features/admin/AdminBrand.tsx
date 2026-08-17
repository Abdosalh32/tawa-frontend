import './admin.css'

/** هوية لوحة الإدارة أعلى القائمة الجانبية (برومت 16) */
export function AdminBrand() {
  return (
    <div>
      <p className="admin-brand__name">توا</p>
      <p className="admin-brand__sub">إدارة المنصة</p>
    </div>
  )
}
