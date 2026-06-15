import { createContext, useContext, useState, ReactNode } from 'react'

type LocaliteContextType = {
  activeNiveauId: number
  setActiveNiveauId: (id: number) => void
}

const LocaliteContext = createContext<LocaliteContextType | undefined>(undefined)

export function LocaliteProvider({ children }: { children: ReactNode }) {
  const [activeNiveauId, setActiveNiveauId] = useState<number>(0)

  return (
    <LocaliteContext.Provider value={{ activeNiveauId, setActiveNiveauId }}>
      {children}
    </LocaliteContext.Provider>
  )
}

export function useLocaliteContext() {
  const context = useContext(LocaliteContext)
  if (!context) {
    throw new Error('useLocaliteContext must be used within LocaliteProvider')
  }
  return context
}