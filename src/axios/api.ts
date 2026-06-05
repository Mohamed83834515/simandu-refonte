// lib/axios.ts
import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { useSessionStore } from '@/stores/others/session.store'
import { getConfigDuration } from '@/lib/session-config'

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.ruche-sectoriel.net/api/',
  timeout: 30000,
  withCredentials: true,  // send cookies automatically if using httpOnly cookies
})

// ─── Token manager ────────────────────────────────────────────────────────────
// If you must use localStorage, at least centralise it here
// Prefer httpOnly cookies set by the server — in that case delete this entirely
const TOKEN_KEYS = { ACCESS: 'access_token', REFRESH: 'refresh_token' }

export const tokenManager = {
  getAccessToken:  () => localStorage.getItem(TOKEN_KEYS.ACCESS),
  getRefreshToken: () => localStorage.getItem(TOKEN_KEYS.REFRESH),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEYS.ACCESS, access)
    localStorage.setItem(TOKEN_KEYS.REFRESH, refresh)
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEYS.ACCESS)
    localStorage.removeItem(TOKEN_KEYS.REFRESH)
  },
}

// ─── Refresh queue ────────────────────────────────────────────────────────────
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []
// Pass the new access token to queued requests instead of re-reading localStorage
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

// ─── Excluded from refresh logic ──────────────────────────────────────────────
const EXCLUDED = ['/token/', '/token/refresh/', '/auth/login', '/auth/refresh']
const isExcluded = (url?: string) => EXCLUDED.some(e => url?.includes(e))

// ─── Request interceptor — attach token ──────────────────────────────────────
api.interceptors.request.use(config => {
  const token = tokenManager.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Reset inactivity timer on every successful response
    const { reset, intervalRef } = useSessionStore.getState()
    const duration = getConfigDuration()
    if (intervalRef && duration > 0) reset(duration)

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Let excluded endpoints fall through to their own catch
    if (isExcluded(originalRequest.url)) {
      return Promise.reject(error)
    }

    // ── 401 handling ──────────────────────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Another request is already refreshing — queue this one
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            if (!originalRequest.headers) originalRequest.headers = {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      const refreshToken = tokenManager.getRefreshToken()

      if (!refreshToken) {
        isRefreshing = false
        tokenManager.clearTokens()
        useSessionStore.getState().stop()   // stop timer only when truly logging out
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }

      try {
        const { data } = await api.post('/token/refresh/', { refresh: refreshToken })
        const { access } = data

        tokenManager.setTokens(access, refreshToken)
        isRefreshing = false
        onRefreshed(access)   // unblock queued requests with new token

        // Resume original request with new token
        if (!originalRequest.headers) originalRequest.headers = {}
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)

      } catch (refreshError) {
        isRefreshing = false
        tokenManager.clearTokens()
        useSessionStore.getState().stop()   // now it's safe to stop
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ─── Client with retry ────────────────────────────────────────────────────────
const RETRYABLE_STATUS = new Set([500, 502, 503, 504])

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: AxiosRequestConfig & { retries?: number } = {}
  ): Promise<T> {
    const { retries = 3, ...axiosConfig } = options

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await api.request<T>({ url: endpoint, ...axiosConfig })
        return res.data
      } catch (err) {
        const isAxiosErr  = err instanceof AxiosError
        const status      = (err as AxiosError)?.response?.status
        const shouldRetry = isAxiosErr && status !== undefined && RETRYABLE_STATUS.has(status)

        if (attempt < retries && shouldRetry) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000))
          continue
        }
        throw err
      }
    }
    throw new Error('Max retries exceeded')
  },
}