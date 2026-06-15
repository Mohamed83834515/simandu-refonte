import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean

  setAuthenticated: (value: boolean) => void

  login: () => void

  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

  login: () => set({ isAuthenticated: true }),

  logout: () => {
    set({ isAuthenticated: false })
  },

  // alias used by QueryCache 401 handler in main.tsx
  reset: () => {
    set({ isAuthenticated: false })
  },
}))
