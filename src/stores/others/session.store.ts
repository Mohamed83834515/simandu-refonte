
import { create } from 'zustand'

interface SessionState {
  remainingSeconds: number
  isWarningVisible: boolean
  intervalRef:      ReturnType<typeof setInterval> | null

  start:      (durationSeconds: number) => void
  reset:      (durationSeconds: number) => void
  stop:       () => void
  setWarning: (visible: boolean) => void
}



export const useSessionStore = create<SessionState>((set, get) => ({
  remainingSeconds:  0,
  isWarningVisible:  false,
  intervalRef:       null,

start: (durationSeconds) => {
  const { stop } = get()
  stop()

  // Warning at 25% of duration remaining, max 10 minutes
  const warningThreshold = Math.min(
    Math.floor(durationSeconds * 0.25),
    600  // never more than 10 min
  )

  const ref = setInterval(() => {
    const { remainingSeconds, setWarning } = get()
    const next = remainingSeconds - 1

    if (next <= 0) {
      get().stop()
      set({ remainingSeconds: 0 })
      return
    }

    if (next <= warningThreshold && !get().isWarningVisible) {
      setWarning(true)
    }

    set({ remainingSeconds: next })
  }, 1000)

  set({ remainingSeconds: durationSeconds, intervalRef: ref, isWarningVisible: false })
},

  reset: (durationSeconds) => {
    const { isWarningVisible } = get()
    // only reset warning if we were past the threshold
    set({
      remainingSeconds: durationSeconds,
      ...(isWarningVisible && { isWarningVisible: false }),
    })
  },

  stop: () => {
    const { intervalRef } = get()
    if (intervalRef) clearInterval(intervalRef)
    set({ intervalRef: null })
  },

  setWarning: (visible) => set({ isWarningVisible: visible }),
}))