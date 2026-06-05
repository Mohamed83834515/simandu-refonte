
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

const WARNING_THRESHOLD_SECONDS = 10 * 60  // show warning at 10 min remaining

export const useSessionStore = create<SessionState>((set, get) => ({
  remainingSeconds:  0,
  isWarningVisible:  false,
  intervalRef:       null,

  start: (durationSeconds) => {
    const { stop } = get()
    stop()  // clear any existing interval first

    const ref = setInterval(() => {
      const { remainingSeconds, setWarning } = get()
      const next = remainingSeconds - 1

      if (next <= 0) {
        get().stop()
        // signal logout — SessionProvider listens to this
        set({ remainingSeconds: 0 })
        return
      }

      if (next <= WARNING_THRESHOLD_SECONDS && !get().isWarningVisible) {
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