/**
 * فحص طبقة الاتصال (المرحلة ١) دون الحاجة إلى الباكند:
 * خادم وهمي محلي يردّ بالحالات التي تهمّنا، ونتأكد أن `apiClient` يتصرف كما وُعد.
 *   node scripts/interceptor-check.mjs
 */
import { createServer } from 'node:http'
import { apiClient, apiGet, apiPost, setUnauthorizedHandler } from '../src/lib/apiClient.ts'
import { clearAuthToken, getAuthToken, setAuthToken } from '../src/lib/auth-token.ts'
import { extractError, fieldErrorOf } from '../src/lib/errors.ts'

const seen = { authHeader: undefined }
const server = createServer((req, res) => {
  if (req.url.startsWith('/echo-auth')) {
    seen.authHeader = req.headers.authorization ?? null
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: true, message: 'تم', data: { ok: true } }))
  }
  if (req.url.startsWith('/401')) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: 'غير مصرّح.' }))
  }
  if (req.url.startsWith('/403')) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false, message: 'ليس لديك صلاحية لإدارة هذا المتجر.' }))
  }
  if (req.url.startsWith('/422')) {
    res.writeHead(422, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      message: 'البيانات المدخلة غير صحيحة.',
      errors: { 'shipping_address.city': ['حقل المدينة مطلوب.'], payment_method: ['طريقة الدفع غير مدعومة.'] },
    }))
  }
  if (req.url.startsWith('/500')) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ success: false }))
  }
  if (req.url.startsWith('/slow')) {
    return setTimeout(() => { res.writeHead(200); res.end('{}') }, 3000)
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ success: true, message: 'تم بنجاح', data: { id: 7, name: 'متجر العافية' } }))
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const port = server.address().port
apiClient.defaults.baseURL = `http://127.0.0.1:${port}`

const results = []
const check = (name, pass, detail = '') => results.push({ name, pass, detail })
const failed = async (fn) => { try { await fn(); return null } catch (error) { return error } }

/* ١) الغلاف الموحد: apiGet يعيد data وحدها، والكتابة تعيد الرسالة معها */
const data = await apiGet('/ok')
check('apiGet يفكّ الغلاف ويعيد data', data?.name === 'متجر العافية', JSON.stringify(data))
const written = await apiPost('/ok', { any: true })
check('apiPost يعيد data ورسالة الخادم', written.data?.id === 7 && written.message === 'تم بنجاح', written.message)

/* ٢) حقن التوكن في كل نداء */
clearAuthToken()
await apiGet('/echo-auth')
check('بلا توكن: لا ترويسة Authorization', seen.authHeader === undefined || seen.authHeader === null, String(seen.authHeader))
setAuthToken('tok_123')
await apiGet('/echo-auth')
check('مع توكن: Bearer يُحقن تلقائياً', seen.authHeader === 'Bearer tok_123', String(seen.authHeader))

/* ٣) 401 يمسح الجلسة ويستدعي المعالج المسجَّل */
let handlerCalls = 0
setUnauthorizedHandler(() => { handlerCalls += 1 })
const authError = await failed(() => apiGet('/401'))
check('401 ⇒ kind=auth ورسالة الخادم كما هي', authError?.kind === 'auth' && authError.message === 'غير مصرّح.', authError?.message)
check('401 ⇒ التوكن مُسح', getAuthToken() === null, String(getAuthToken()))
check('401 ⇒ معالج انتهاء الجلسة نُفِّذ مرة', handlerCalls === 1, `calls=${handlerCalls}`)

/* ٤) 403 يمرّ برسالة الخادم العربية دون اختراع نص */
const forbidden = await failed(() => apiGet('/403'))
check('403 ⇒ kind=forbidden برسالة الخادم', forbidden?.kind === 'forbidden' && forbidden.message.includes('صلاحية'), forbidden?.message)

/* ٥) 422 يتحوّل إلى أخطاء حقول بمسارات الباكند نفسها */
const validation = await failed(() => apiPost('/422', {}))
check('422 ⇒ kind=validation', validation?.kind === 'validation', validation?.kind)
check(
  '422 ⇒ أخطاء الحقول بمسار الباكند',
  fieldErrorOf(validation, 'shipping_address.city') === 'حقل المدينة مطلوب.' && fieldErrorOf(validation, 'payment_method')?.length > 0,
  Object.keys(validation?.fieldErrors ?? {}).join(', '),
)
check('422 ⇒ حقل غير مذكور يعيد undefined', fieldErrorOf(validation, 'customer_name') === undefined, 'ok')

/* ٦) 500 و«لا استجابة» و«مهلة» */
const serverError = await failed(() => apiGet('/500'))
check('500 ⇒ kind=server برسالة احتياط', serverError?.kind === 'server' && serverError.message.length > 0, serverError?.message)

apiClient.defaults.timeout = 300
const timeout = await failed(() => apiGet('/slow'))
check('تجاوز المهلة ⇒ kind=timeout', timeout?.kind === 'timeout', timeout?.kind)
apiClient.defaults.timeout = 15_000

apiClient.defaults.baseURL = 'http://127.0.0.1:1'
const offline = await failed(() => apiGet('/anything'))
check('الخادم مطفأ ⇒ kind=network برسالة «تعذّر الاتصال»', offline?.kind === 'network' && offline.message.includes('تعذّر الاتصال'), offline?.message)

/* ٧) extractError لا يترجم خطأً مترجَماً مرتين */
check('extractError متعدٍّ آمن (idempotent)', extractError(offline) === offline, 'ok')

server.close()
console.log(`\nفحص طبقة الاتصال — خادم وهمي محلي\n${'─'.repeat(60)}`)
for (const r of results) console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}${r.detail ? `  ← ${r.detail}` : ''}`)
const failures = results.filter((r) => !r.pass).length
console.log(`\n${'─'.repeat(60)}\n${results.length - failures}/${results.length} ناجح${failures ? ` · ${failures} فاشل` : ' — الطبقة سليمة'}\n`)
process.exit(failures ? 1 : 0)
