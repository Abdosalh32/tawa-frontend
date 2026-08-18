import { isAxiosError } from 'axios'

/**
 * ترجمة أي خطأ شبكة إلى شكل واحد تفهمه كل الشاشات.
 *
 * **قاعدة الرسائل (خطة الربط):** الباكند يرسل `message` عربية جاهزة، فنعرضها كما هي.
 * النصوص أدناه احتياط لا يظهر إلا حين لا يرسل الخادم رسالة (انقطاع، أو خطأ خام).
 */

export type ApiErrorKind =
  | 'validation'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'network'
  | 'timeout'
  | 'unknown'

/** أخطاء الحقول كما يرسلها Laravel: المفتاح مسار الحقل (`shipping_address.city`) */
export type FieldErrors = Readonly<Record<string, string>>

export interface ApiError {
  /** رمز HTTP — يغيب حين لا تصل استجابة أصلاً */
  status?: number
  kind: ApiErrorKind
  /** ما يُعرض للمستخدم: رسالة الخادم إن وُجدت، وإلا الاحتياط */
  message: string
  fieldErrors: FieldErrors
}

const FALLBACK_MESSAGE: Readonly<Record<ApiErrorKind, string>> = {
  validation: 'راجع الحقول المميّزة ثم أعد المحاولة.',
  auth: 'انتهت جلستك — سجّل الدخول من جديد.',
  forbidden: 'ليس لديك صلاحية لهذا الإجراء.',
  not_found: 'العنصر المطلوب غير موجود.',
  rate_limit: 'محاولات كثيرة — انتظر قليلاً ثم أعد المحاولة.',
  server: 'حدث خطأ في الخادم — أعد المحاولة بعد قليل.',
  network: 'تعذّر الاتصال بالخادم — تحقق من اتصالك ثم أعد المحاولة.',
  timeout: 'استغرق الخادم وقتاً أطول من المتوقع — أعد المحاولة.',
  unknown: 'حدث خطأ غير متوقع — أعد المحاولة.',
}

function kindOf(status: number): ApiErrorKind {
  if (status === 401) return 'auth'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 422) return 'validation'
  if (status === 429) return 'rate_limit'
  if (status >= 500) return 'server'
  return 'unknown'
}

/** Laravel: `errors: { field: [msg, …] }` — نأخذ أول رسالة لكل حقل */
function toFieldErrors(errors: unknown): FieldErrors {
  if (typeof errors !== 'object' || errors === null) return {}
  const result: Record<string, string> = {}
  for (const [field, messages] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      result[field] = messages[0]
    } else if (typeof messages === 'string') {
      result[field] = messages
    }
  }
  return result
}

function serverMessageOf(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const message = (payload as { message?: unknown }).message
  return typeof message === 'string' && message.trim() !== '' ? message : undefined
}

export function extractError(error: unknown): ApiError {
  /* مُترجَم مسبقاً (خرج من معترض الاستجابة) — لا نترجمه مرتين */
  if (isApiError(error)) return error

  if (isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status
      const kind = kindOf(status)
      const payload = error.response.data
      return {
        status,
        kind,
        message: serverMessageOf(payload) ?? FALLBACK_MESSAGE[kind],
        fieldErrors: kind === 'validation' ? toFieldErrors((payload as { errors?: unknown } | undefined)?.errors) : {},
      }
    }
    /* لا استجابة: انقطاع أو مهلة أو CORS مرفوض */
    const kind: ApiErrorKind = error.code === 'ECONNABORTED' ? 'timeout' : 'network'
    return { kind, message: FALLBACK_MESSAGE[kind], fieldErrors: {} }
  }

  return { kind: 'unknown', message: FALLBACK_MESSAGE.unknown, fieldErrors: {} }
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    'message' in value &&
    'fieldErrors' in value &&
    typeof (value as ApiError).message === 'string'
  )
}

/** رسالة الحقل بمساره كما يسمّيه الباكند — تُمرَّر مباشرة لخاصية `error` في الحقول */
export function fieldErrorOf(error: ApiError | null | undefined, path: string): string | undefined {
  return error?.fieldErrors[path]
}
