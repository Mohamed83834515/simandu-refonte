import { createContext, useContext, type ReactNode } from 'react'
import { usePpmVersionSelection } from '@/simadou/allHooks/admin/versionPPMHooks'

type PpmVersionContextValue = ReturnType<typeof usePpmVersionSelection>

const PpmVersionContext = createContext<PpmVersionContextValue | null>(null)

export function PpmVersionProvider({ children }: { children: ReactNode }) {
  const value = usePpmVersionSelection()
  return (
    <PpmVersionContext.Provider value={value}>
      {children}
    </PpmVersionContext.Provider>
  )
}

export function usePpmVersionContext() {
  const context = useContext(PpmVersionContext)
  if (!context) {
    throw new Error(
      'usePpmVersionContext must be used within PpmVersionProvider'
    )
  }
  return context
}
