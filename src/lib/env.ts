/**
 * إعدادات البيئة — مصدر واحد لعنوان الـAPI.
 * القيمة من `.env.local` (انظر `.env.example`)، وحين تغيب نسقط على الافتراضي المحلي
 * كي لا تنهار البيئة على مطوّر جديد لم ينسخ الملف بعد.
 */

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api'

/* التسلسل الاختياري مقصود: الوحدة تُستورد أيضاً في سكربتات Node حيث لا وجود لـ import.meta.env */
const CONFIGURED = import.meta.env?.VITE_API_BASE_URL

export const API_BASE_URL: string = (CONFIGURED ?? DEFAULT_API_BASE_URL).replace(/\/+$/, '')

/** هل نعمل على الافتراضي؟ — يفيد في تشخيص «لماذا لا يصل شيء؟» */
export const API_BASE_URL_IS_DEFAULT = CONFIGURED === undefined
