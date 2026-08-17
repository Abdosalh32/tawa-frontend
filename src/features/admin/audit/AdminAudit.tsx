import { useMemo, useState } from 'react'
import '../admin.css'
import './audit.css'
import {
  Alert,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  EmptyState,
  ErrorState,
  FilterBar,
  Input,
  PageHeader,
  Pagination,
  Radio,
  SearchField,
  Select,
  Skeleton,
  Topbar,
} from '../../../components/ui'
import { AdminSidebar } from '../AdminSidebar'
import { AUDIT_RECORDS, OPERATION_META } from './mock-data'
import type { AuditOperation, AuditRecord } from './mock-data'

const PAGE_SIZE = 5

/** حالة عرض تطويرية محلية — الافتراضي «عادية» */
type ScreenView = 'normal' | 'loading' | 'error'

const VIEW_OPTIONS: ReadonlyArray<{ value: ScreenView; label: string }> = [
  { value: 'normal', label: 'عادية (الافتراضية)' },
  { value: 'loading', label: 'تحميل' },
  { value: 'error', label: 'خطأ' },
]

export function AdminAudit() {
  const [view, setView] = useState<ScreenView>('normal')
  const [search, setSearch] = useState('')
  const [operation, setOperation] = useState<'all' | AuditOperation>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)

  const filtersActive = search.trim() !== '' || operation !== 'all' || fromDate !== '' || toDate !== ''

  const resetFilters = () => {
    setSearch('')
    setOperation('all')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  /* تصفية محلية على البيانات التجريبية — نطاق التاريخ عرضي (التواريخ نصوص عرض) */
  const filtered = useMemo(() => {
    const query = search.trim()
    return AUDIT_RECORDS.filter((record) => {
      if (operation !== 'all' && record.operation !== operation) return false
      if (query && !record.description.includes(query) && !record.id.includes(query.toUpperCase())) return false
      return true
    })
  }, [search, operation])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  /** التجميع حسب اليوم مع الحفاظ على الترتيب (برومت 21) */
  const groups = useMemo(() => {
    const map = new Map<string, AuditRecord[]>()
    for (const record of pageRows) {
      const bucket = map.get(record.dayGroup) ?? []
      bucket.push(record)
      map.set(record.dayGroup, bucket)
    }
    return [...map.entries()]
  }, [pageRows])

  return (
    <AppShell
      context="admin"
      className="admin-shell"
      sidebar={<AdminSidebar active="audit" />}
      topbar={<Topbar title="لوحة مدير المنصة" userName="جواد" />}
    >
      <PageHeader
        title="سجل التدقيق"
        description="يسجّل العمليات الحساسة على المنصة — للقراءة فقط، ولا يمكن تعديله أو حذف قيوده"
        meta={
          <Badge variant="neutral" dot={false}>
            قراءة فقط
          </Badge>
        }
        breadcrumbs={<Breadcrumbs items={[{ label: 'الرئيسية' }, { label: 'سجل التدقيق' }]} />}
        secondaryActions={<Button variant="ghost">تصدير السجل</Button>}
      />

      <fieldset className="dev-fieldset">
        <legend>أداة معاينة تطويرية — حالة الشاشة (بيانات تجريبية، لا استعلام فعلياً)</legend>
        <div className="dev-fieldset__options">
          {VIEW_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name="audt-view"
              label={option.label}
              checked={view === option.value}
              onChange={() => setView(option.value)}
            />
          ))}
        </div>
      </fieldset>

      {view === 'loading' ? (
        <div aria-hidden="true" style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} variant="rect" height={56} />
          ))}
        </div>
      ) : view === 'error' ? (
        <div className="admin-card">
          <ErrorState description="تعذّر جلب سجل التدقيق — تحقق من اتصالك ثم أعد المحاولة." onRetry={() => setView('normal')} />
        </div>
      ) : (
        <>
          <FilterBar
            search={
              <SearchField
                label="بحث في السجل"
                placeholder="وصف العملية أو معرّفها…"
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
              />
            }
            filters={
              <>
                <Select
                  label="نوع العملية"
                  value={operation}
                  onChange={(event) => {
                    setOperation(event.target.value as 'all' | AuditOperation)
                    setPage(1)
                  }}
                >
                  <option value="all">كل العمليات</option>
                  {Object.entries(OPERATION_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </Select>
                <Input label="من تاريخ" type="date" optional value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                <Input label="إلى تاريخ" type="date" optional value={toDate} onChange={(event) => setToDate(event.target.value)} />
              </>
            }
            actions={
              filtersActive && (
                <Button variant="ghost" onClick={resetFilters}>
                  مسح الفلاتر
                </Button>
              )
            }
          />

          {(fromDate !== '' || toDate !== '') && (
            <Alert variant="info" title="نطاق التاريخ عرضي في هذه المعاينة">
              تواريخ السجل التجريبي نصوص عرض («اليوم/أمس») فلا تُصفّى فعلياً — التصفية بالتاريخ تعمل مع الربط الخلفي.
            </Alert>
          )}

          {filtered.length === 0 ? (
            <div className="admin-card">
              <EmptyState
                title="لا قيود مطابقة"
                description="جرّب تعديل كلمات البحث أو نوع العملية."
                action={
                  <Button variant="secondary" onClick={resetFilters}>
                    مسح الفلاتر
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {groups.map(([day, records]) => (
                <section className="audt-group" key={day} aria-label={`عمليات ${day}`}>
                  <h2 className="audt-group__title">{day}</h2>
                  {records.map((record) => {
                    const meta = OPERATION_META[record.operation]
                    const tone = record.critical ? 'critical' : meta.tone
                    return (
                      <details className={`audt-item audt-item--${tone}`} key={record.id}>
                        <summary>
                          <Badge
                            variant={
                              meta.tone === 'success'
                                ? 'success'
                                : meta.tone === 'critical'
                                  ? 'error'
                                  : meta.tone === 'warning'
                                    ? 'warning'
                                    : 'info'
                            }
                          >
                            {meta.label}
                          </Badge>
                          <span className="audt-item__desc">{record.description}</span>
                          <span className="audt-item__meta">
                            <span className="numeric">{record.time}</span>
                            <span className="ltr">{record.id}</span>
                          </span>
                        </summary>
                        <div className="audt-details">
                          {record.details.before && (
                            <p className="audt-details__row">
                              <span className="audt-details__label">القيمة قبل</span>
                              <span>{record.details.before}</span>
                            </p>
                          )}
                          {record.details.after && (
                            <p className="audt-details__row">
                              <span className="audt-details__label">القيمة بعد</span>
                              <span>{record.details.after}</span>
                            </p>
                          )}
                          {record.details.reason && (
                            <p className="audt-details__row">
                              <span className="audt-details__label">السبب المكتوب</span>
                              <span>{record.details.reason}</span>
                            </p>
                          )}
                          <p className="audt-details__row">
                            <span className="audt-details__label">المنفّذ</span>
                            <span>{record.executedBy}</span>
                          </p>
                          <p className="audt-details__row">
                            <span className="audt-details__label">عنوان IP</span>
                            <span className="ltr">{record.details.ipAddress}</span>
                          </p>
                        </div>
                      </details>
                    )
                  })}
                </section>
              ))}

              <div className="audt-readonly">
                <p className="admin-note">
                  فلتر «المنفّذ» مؤجل: تعدد مديري المنصة وصلاحياتهم قرار مفقود (M8) — المنفّذ مسجّل في كل قيد.
                </p>
                <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
              </div>
            </>
          )}
        </>
      )}
    </AppShell>
  )
}
