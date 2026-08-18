/**
 * بوابة الربط الآلية — تشغّل فحوص المراحل المنجزة وتطبع تقرير ✅/❌.
 *   node scripts/api-gate.mjs [baseUrl]
 * العنوان من الوسيط، أو من VITE_API_BASE_URL، أو الافتراضي المحلي.
 */
import { readFileSync } from 'node:fs'

function envBaseUrl() {
  for (const file of ['.env.local', '.env']) {
    try {
      const match = readFileSync(file, 'utf8').match(/^VITE_API_BASE_URL=(.+)$/m)
      if (match) return match[1].trim()
    } catch { /* الملف غير موجود — نجرّب التالي */ }
  }
  return 'http://127.0.0.1:8000/api'
}

const BASE = (process.argv[2] ?? process.env.VITE_API_BASE_URL ?? envBaseUrl()).replace(/\/+$/, '')
const ORIGIN = 'http://localhost:5173'
const results = []
const check = (phase, name, pass, detail = '') => results.push({ phase, name, pass, detail })

async function call(path, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', Origin: ORIGIN, ...(init.headers ?? {}) },
    })
    const text = await response.text()
    let json = null
    try { json = JSON.parse(text) } catch { /* ليست JSON */ }
    return { ok: true, status: response.status, headers: response.headers, json, text }
  } catch (error) {
    return { ok: false, error: error.name === 'AbortError' ? 'timeout' : String(error.cause?.code ?? error.message) }
  } finally {
    clearTimeout(timer)
  }
}

/* ═══ المرحلة 0 — الخادم والـCORS ═══ */
const health = await call('/health')
check(0, 'الخادم يستجيب على /health', health.ok && health.status === 200, health.ok ? `HTTP ${health.status}` : health.error)
check(0, 'الاستجابة JSON بحقل status=ok', health.json?.status === 'ok', health.json ? JSON.stringify(health.json).slice(0, 90) : '—')

const cors = health.ok ? health.headers.get('access-control-allow-origin') : null
check(0, `CORS يسمح بـ ${ORIGIN}`, cors === '*' || cors === ORIGIN, cors ?? 'لا ترويسة Access-Control-Allow-Origin')

/* ═══ المرحلة 1 — سلوك الأخطاء الذي تعتمد عليه المعترضات ═══ */
const notFound = await call('/v1/merchant/auth/__missing__')
check(1, '404 يعيد JSON لا صفحة HTML', notFound.ok && notFound.json !== null, notFound.ok ? `HTTP ${notFound.status}` : notFound.error)

const unauthorized = await call('/v1/merchant/auth/profile')
check(1, 'مسار محمي بلا توكن ⇒ 401', unauthorized.ok && unauthorized.status === 401, unauthorized.ok ? `HTTP ${unauthorized.status}` : unauthorized.error)

const badToken = await call('/v1/merchant/auth/profile', { headers: { Authorization: 'Bearer invalid.token.value' } })
check(1, 'توكن فاسد ⇒ 401 (يشغّل مسح الجلسة)', badToken.ok && badToken.status === 401, badToken.ok ? `HTTP ${badToken.status}` : badToken.error)

const validation = await call('/v1/merchant/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}),
})
check(1, 'طلب ناقص ⇒ 422', validation.ok && validation.status === 422, validation.ok ? `HTTP ${validation.status}` : validation.error)
check(
  1,
  '422 يحمل errors بشكل { field: [msg] }',
  Boolean(validation.json?.errors && Object.values(validation.json.errors).some((v) => Array.isArray(v))),
  validation.json?.errors ? Object.keys(validation.json.errors).join(', ') : '—',
)
check(
  1,
  '422 يحمل message جاهزة للعرض',
  validation.status === 422 && typeof validation.json?.message === 'string' && validation.json.message.length > 0,
  validation.json?.message ?? '—',
)

/* ═══ التقرير ═══ */
console.log(`\nبوابة الربط — ${BASE}\n${'─'.repeat(60)}`)
let lastPhase = -1
for (const r of results) {
  if (r.phase !== lastPhase) { console.log(`\nالمرحلة ${r.phase}`); lastPhase = r.phase }
  console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}${r.detail ? `  ← ${r.detail}` : ''}`)
}
const failed = results.filter((r) => !r.pass).length
console.log(`\n${'─'.repeat(60)}\n${results.length - failed}/${results.length} ناجح${failed ? ` · ${failed} فاشل` : ' — البوابة مفتوحة'}\n`)
process.exit(failed ? 1 : 0)
