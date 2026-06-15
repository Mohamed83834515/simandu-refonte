import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSessionStore } from '@/stores/others/session.store'
import { useAuthStore } from '@/stores/auth-store'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'
import { setSessionDuration } from '@/lib/session-config'
import { SessionWarningDialog } from '@/components/others/SessionWarningDialog'
import { toast } from 'sonner'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const navigate   = useNavigate()
  const { logout } = useAuthStore()
  const { isAuthenticated } = useAuthStore()
  const { start, stop, remainingSeconds, isWarningVisible } = useSessionStore()
  const durationRef  = useRef<number>(0)
  const hasLoggedOut = useRef(false)

 
  const { data: config } = useGeneralParamsQuery()

  useEffect(() => {
    if (!isAuthenticated) {
      stop()
      return
    }

    if (!config) return

    const inactivityMinutes = config.inactivityDelayMinutes ?? 0
    const duration          = inactivityMinutes * 60  // convert to seconds

    // Sync to module cache so axios interceptor can read it
    setSessionDuration(inactivityMinutes)

    // 0 = unlimited — don't start the timer
    if (duration === 0) return

    durationRef.current  = duration
    hasLoggedOut.current = false  // reset on new session
    start(duration)

    return () => stop()
  }, [config, isAuthenticated, start, stop])

  // Watch for expiry
  useEffect(() => {
    if (
      remainingSeconds === 0 &&
      durationRef.current > 0 &&
      !hasLoggedOut.current
    ) {
      hasLoggedOut.current = true
      logout()
      navigate({ to: '/sign-in', replace : true })
      toast.info('Session expirée. Veuillez vous reconnecter.')
    }
  }, [logout, navigate, remainingSeconds])

  return (
    <>
      {children}
      {isWarningVisible && isAuthenticated && (
        <SessionWarningDialog
          remainingSeconds={remainingSeconds}
          onExtend={() => {
            useSessionStore.getState().reset(durationRef.current)
          }}
        />
        
      )}
    </>
  )
}