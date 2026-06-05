// router/guards.ts  (TanStack Router beforeLoad)
import { redirect } from '@tanstack/react-router'
import { authService } from './allSercices/authService'
import { useAuthStore } from '@/stores/auth-store'

export async function requireAuth() {
    console.log("isAuthentificated :", authService.isAuthenticated())
  if (!authService.isAuthenticated()) {
    // Try a silent refresh before hard-redirecting
    const refreshed = await authService.refreshToken()

    if (!refreshed) {
       throw redirect({
        to: '/sign-in',
        search: { redirect: location.href }, 
        replace: true,
      })
    }
    // Rehydrate store after refresh
    useAuthStore.getState().hydrateFromToken()
  }
}

