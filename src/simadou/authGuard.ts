// router/guards.ts  (TanStack Router beforeLoad)
import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from './allSercices/authService'

export async function requireAuth() {
  try {
    await authService.me()
    useAuthStore.getState().setAuthenticated(true)
  } catch {
    useAuthStore.getState().logout()
    throw redirect({
      to: '/sign-in',
      search: { redirect: location.href },
      replace: true,
    })
  }
}
