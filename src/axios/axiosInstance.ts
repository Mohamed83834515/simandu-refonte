import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionStore } from '@/stores/others/session.store'

const BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.ruche-sectoriel.net/api'

// Instance publique
export const publicInstance = axios.create({
  baseURL: BASE_URL,
})

// Instance authentifiée
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

const logout = () => {
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

// ─────────────────────────────────────────────
// Request interceptor
// ─────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─────────────────────────────────────────────
// Response interceptor
// ─────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(
        new Error('Erreur réseau - Vérifiez votre connexion')
      )
    }

    if (error.response.status === 401) {
      logout()
    }

    return Promise.reject(error)
  }
)
