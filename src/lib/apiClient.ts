import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './env'
import { clearAuthToken, getAuthToken } from './auth-token'
import { extractError } from './errors'
import type { ApiError } from './errors'

/**
 * نسخة Axios الوحيدة في المشروع — كل نداء يمر بها فتُحقن المصادقة
 * وتُترجم الأخطاء في مكان واحد. لا `fetch` مباشراً في الشاشات.
 */

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

/* ═══ ما يحدث عند انتهاء الجلسة ═══ */

let onUnauthorized: () => void = () => {
  /* احتياط قبل أن يسجّل التطبيق معالجه: تنقّل صلب لشاشة الدخول */
  if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
    window.location.assign('/auth')
  }
}

/** يسجّله التطبيق مرة واحدة ليستعمل تنقّل الراوتر بدل إعادة تحميل الصفحة */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

/* ═══ المعترضات ═══ */

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = extractError(error)
    if (apiError.kind === 'auth') {
      /* التوكن لم يعد صالحاً — لا معنى لإبقائه */
      clearAuthToken()
      onUnauthorized()
    }
    if (apiError.kind === 'server') {
      console.error('[api] خطأ خادم', apiError.status, apiError.message)
    }
    /* كل مستهلك يستقبل `ApiError` موحداً لا خطأ Axios خاماً */
    return Promise.reject(apiError)
  },
)

/* ═══ الغلاف الموحد للاستجابات ═══ */

/** شكل استجابة الباكند الثابت: `{ success, message, data }` */
export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
  /** ترقيم الصفحات حين يرسله المسار — شكله يُحسم عند أول مسار مرقّم */
  meta?: unknown
}

export async function request<T>(config: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
  const response = await apiClient.request<ApiEnvelope<T>>(config)
  return response.data
}

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  return (await request<T>({ method: 'GET', url, params })).data
}

/** الكتابة تُرجع الرسالة أيضاً — الباكند يرسل نص النجاح العربي جاهزاً للعرض */
export interface ApiResult<T> {
  data: T
  message?: string
}

async function write<T>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: unknown): Promise<ApiResult<T>> {
  const envelope = await request<T>({ method, url, data: body })
  return { data: envelope.data, message: envelope.message }
}

export const apiPost = <T>(url: string, body?: unknown) => write<T>('POST', url, body)
export const apiPut = <T>(url: string, body?: unknown) => write<T>('PUT', url, body)
export const apiDelete = <T>(url: string, body?: unknown) => write<T>('DELETE', url, body)

export type { ApiError }
