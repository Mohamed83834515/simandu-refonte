// providers/SessionProvider.tsx
import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSessionStore } from '@/stores/others/session.store'
import { useGeneralParamsQuery } from '../allHooks/generalParams/queries'
import { useAuthStore } from '@/stores/auth-store'
import { SessionWarningDialog } from '@/components/others/SessionWarningDialog'
import { toast } from 'sonner'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const navigate        = useNavigate()
  const { data: config } = useGeneralParamsQuery()
  const { logout }      = useAuthStore()
  const { start, stop, remainingSeconds, isWarningVisible } = useSessionStore()
  const durationRef     = useRef<number>(0)
  const hasLoggedOut    = useRef(false)

  useEffect(() => {
    if (!config) return
    const duration = config.inactivityDelayMinutes ? config.inactivityDelayMinutes * 60  : 0 // convert to seconds

    if (duration === 0) return   // infinite — do nothing

    durationRef.current = duration
    start(duration)

    return () => stop()
  }, [config])

  // Watch for expiry
  useEffect(() => {
    if (remainingSeconds === 0 && durationRef.current > 0 && !hasLoggedOut.current) {
      hasLoggedOut.current = true
      logout()
      navigate({ to: '/sign-in' })
      toast.info('Session expirée. Veuillez vous reconnecter.')
    }
  }, [remainingSeconds])

  return (
    <>
      {children}
      {isWarningVisible && (
        <SessionWarningDialog
          remainingSeconds={remainingSeconds}
          onExtend={() => {
            // any API call will reset naturally via interceptor
            // but we can also manually reset here
            useSessionStore.getState().reset(durationRef.current)
          }}
        />
      )}
    </>
  )
}