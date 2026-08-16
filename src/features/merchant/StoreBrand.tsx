import './merchant.css'

/** هوية المتجر أعلى القائمة الجانبية — بيانات تجريبية ثابتة (متجر واحد بحسب الافتراض A1) */
export function StoreBrand() {
  return (
    <div>
      <p className="merchant-brand__name">متجر العافية</p>
      <p className="merchant-brand__domain ltr">alafya.tawa.ly</p>
    </div>
  )
}
