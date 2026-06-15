import { apiClient } from '@/axios/api'
import { toast } from 'sonner'
import type { Personnel } from '../allTypes'

export interface LoginCredentials {
  id_personnel_perso: string
  password: string
}

export interface ResetLinkCredentials {
  email: string
}

export interface ResetPasswordCredentials {
  new_password: string
  confirm_new_password: string
  token: string
  uid: string
}

interface User {
  id?: string
  name?: string
  id_personnel_perso?: string
  personnel?: unknown
}

interface LoginResponse {
  access: string
  refresh: string
  user?: User
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const authService = {
  // Login function
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return await apiClient.request<LoginResponse>('/auth/login/', {
      method: 'POST',
      data: credentials,
    })
  },

  async me(): Promise<Personnel> {
    return apiClient.request('/auth/me/', {
      method: 'GET',
    })
  },

  async reset_link(
    credentials: ResetLinkCredentials,
    mode: 'reset' | 'setup'
  ): Promise<LoginResponse> {
    return await apiClient.request<LoginResponse>(
      mode === 'setup' ? '/password/set/resend/' : '/password/reset/',
      {
        method: 'POST',
        data: credentials,
      }
    )
  },

  async reset_password(
    credentials: ResetPasswordCredentials
  ): Promise<LoginResponse> {
    return await apiClient.request<LoginResponse>('/password/set/', {
      method: 'POST',
      data: credentials,
    })
  },

  async loginWithGoogle(code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.request<LoginResponse>('/auth/google/', {
        method: 'POST',
        data: { code },
      })

      toast.success('Connexion Google réussie')
      return response
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Erreur de connexion Google'
      toast.error(errorMessage)
      throw error
    }
  },

  // Logout function
  async logout(): Promise<void> {
    try {
      await apiClient.request('/auth/logout/', {
        method: 'POST',
      })
      toast.success('Déconnexion réussie')
    } catch {
      // Continue with logout even if server call fails
      toast.success('Déconnexion locale effectuée')
    }
  },

  // Change password function
  async changePassword(id: number, data: ChangePasswordData): Promise<void> {
    await apiClient.request(`/personnel/${id}/password/`, {
      method: 'PUT',
      data: {
        old_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_new_password: data.confirmPassword,
      },
    })
  },
}
