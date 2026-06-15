import { useEffect } from 'react'
import { authService } from '@/simadou/allSercices/authService'
import { useAuthStore } from '@/stores/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated)

  useEffect(() => {
    const init = async () => {
      try {
        await authService.me()
        setAuthenticated(true)
      } catch {
        setAuthenticated(false)
      }
    }

    init()
  }, [setAuthenticated])

  return <>{children}</>
}
