// router/guards.ts  (TanStack Router beforeLoad)
import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from './allSercices/authService'

export async function requireAuth() {
  try {
    await authService.me()
    useAuthStore.getState().setAuthenticated(true)
  } catch {
    // const refreshed = await authService.refreshToken()

    // if (!refreshed) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
        replace: true,
      })
    // }

    // try {
    //   await authService.me()
    //   useAuthStore.getState().setAuthenticated(true)
    // } catch {
    //   throw redirect({
    //     to: '/sign-in',
    //     replace: true,
    //   })
    // }
  }
}
