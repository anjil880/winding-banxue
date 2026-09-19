import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import type { ApiResponse } from '@/types'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let requestCount = 0

function showLoading(): void {
  requestCount += 1
  const uiStore = useUIStore()
  uiStore.showLoading()
}

function hideLoading(): void {
  requestCount = Math.max(0, requestCount - 1)
  if (requestCount === 0) {
    const uiStore = useUIStore()
    uiStore.hideLoading()
  }
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = useAuthStore()
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    if (config.showLoading !== false) {
      showLoading()
    }
    return config
  },
  (error: AxiosError) => {
    hideLoading()
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  ((res: AxiosResponse<ApiResponse<unknown>>) => {
    hideLoading()
    return res.data?.data ?? res.data
  }) as (value: AxiosResponse<ApiResponse<unknown>>) => AxiosResponse<ApiResponse<unknown>>,
  (error: AxiosError<ApiResponse<unknown> | { message?: string }>) => {
    hideLoading()

    const status = error.response?.status
    const resData = error.response?.data
    const rawMessage =
      resData && typeof resData === 'object' && 'message' in resData ? resData.message : undefined
    const msg = (typeof rawMessage === 'string' ? rawMessage : undefined) || error.message

    const uiStore = useUIStore()

    if (status === 401) {
      uiStore.showToast('登录已过期，请重新登录', 'error')
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    } else if (status === 403) {
      uiStore.showToast('无权限执行该操作', 'error')
    } else if (status && status >= 500) {
      uiStore.showToast('服务繁忙，请稍后重试', 'error')
    } else {
      uiStore.showToast(msg || '请求失败', 'error')
    }

    return Promise.reject(error)
  }
)

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    showLoading?: boolean
  }
}
