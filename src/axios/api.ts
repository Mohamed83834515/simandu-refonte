// lib/axios.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionStore } from '@/stores/others/session.store'
import { getConfigDuration } from '@/lib/session-config'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://192.168.1.41:8000/api/'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },

  // 'https://api.ruche-sectoriel.net/api/'
  timeout: 30000,
  withCredentials: true,
})

export const publicApi = axios.create({
  baseURL: BASE_URL,
})

// Excluded endpoints

const EXCLUDED = ['/auth/login']

const isExcluded = (url?: string) => EXCLUDED.some((e) => url?.includes(e))

// Response interceptor

api.interceptors.response.use(
  (response) => {
    const { reset, intervalRef } = useSessionStore.getState()
    const duration = getConfigDuration()

    if (intervalRef && duration > 0) {
      reset(duration)
    }

    return response
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Login endpoint manages its own errors
    if (isExcluded(originalRequest.url)) {
      return Promise.reject(error)
    }

    // 401 => Session expired
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      useSessionStore.getState().stop()

      const isAuthPage = [
        '/sign-in',
        '/sign-up',
        '/forgot-password',
        '/reset-password',
        '/otp',
        '/set-password',
      ].some((path) => window.location.pathname.startsWith(path))

      if (!isAuthPage) {
        window.location.href = '/sign-in'
      }
    }

    return Promise.reject(error)
  }
)

// Retryable client

const RETRYABLE_STATUS = new Set([500, 502, 503, 504])

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: AxiosRequestConfig & {
      retries?: number
    } = {}
  ): Promise<T> {
    const { retries = 3, ...axiosConfig } = options

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await api.request<T>({
          url: endpoint,
          ...axiosConfig,
        })

        return response.data
      } catch (err) {
        const isAxiosErr = err instanceof AxiosError

        const status = (err as AxiosError)?.response?.status

        const shouldRetry =
          isAxiosErr && status !== undefined && RETRYABLE_STATUS.has(status)

        if (attempt < retries && shouldRetry) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          )

          continue
        }

        throw err
      }
    }

    throw new Error('Max retries exceeded')
  },
}
