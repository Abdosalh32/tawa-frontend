import { useSyncExternalStore } from 'react'

/**
 * مخزن توكن Sanctum — نسخة واحدة يقرأ منها معترض الطلبات وواجهة المستخدم.
 *
 * **التخزين: `sessionStorage`** لا `localStorage`: الجلسة تحيا مع تبويب المتصفح
 * فيبقى التاجر داخلاً بعد تحديث الصفحة، وتموت بإغلاق التبويب فلا يبقى توكن
 * على جهاز مشترك. (قرار المرحلة ٢ في خطة الربط.)
 */

const STORAGE_KEY = 'tawa.auth.token'

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    /* وضع خصوصية يمنع التخزين — نكمل بالذاكرة وحدها */
    return null
  }
}

let token: string | null = readStored()
const listeners = new Set<() => void>()

function emit(next: string | null): void {
  token = next
  listeners.forEach((listener) => listener())
}

/** يقرأه معترض الطلبات في كل نداء — متزامن بلا React */
export function getAuthToken(): string | null {
  return token
}

export function setAuthToken(next: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* لا تخزين متاح — يكفي بقاؤه في الذاكرة لهذه الجلسة */
  }
  emit(next)
}

export function clearAuthToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* لا شيء لنمسحه */
  }
  emit(null)
}

/** اشتراك React — الشاشات تعيد الرسم فور دخول التوكن أو خروجه */
export function useAuthToken(): string | null {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
    () => token,
    () => null,
  )
}
