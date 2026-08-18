import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './errors'

/**
 * إعدادات TanStack Query (خطة الربط، المرحلة ١).
 * إعادة المحاولة **لأخطاء الشبكة والخادم وحدها**: تكرار نداء رُفض بـ403 أو 422
 * لا يغيّر النتيجة ويؤخّر ظهور الخطأ للمستخدم.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false
        return isApiError(error) ? ['network', 'timeout', 'server'].includes(error.kind) : false
      },
    },
    mutations: { retry: false },
  },
})
