import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  RapportExportPayload,
  RapportExportRegistration,
} from './export/rapportExportTypes'

type RapportExportContextValue = {
  isRegistered: boolean
  isLoading: boolean
  resolvePayload: () => RapportExportPayload | null
  setExportPayload: (payload: RapportExportRegistration | null) => void
}

const RapportExportContext = createContext<RapportExportContextValue | null>(null)

type ProviderProps = {
  pageTitle: string
  children: ReactNode
}

export function RapportExportProvider({ pageTitle, children }: ProviderProps) {
  const registrationRef = useRef<RapportExportRegistration | null>(null)
  const pageTitleRef = useRef(pageTitle)
  pageTitleRef.current = pageTitle

  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const setExportPayload = useCallback(
    (next: RapportExportRegistration | null) => {
      if (!next) {
        registrationRef.current = null
        setIsRegistered(false)
        setIsLoading(false)
        return
      }

      registrationRef.current = next
      setIsRegistered(true)
      setIsLoading(Boolean(next.isLoading))
    },
    []
  )

  const resolvePayload = useCallback((): RapportExportPayload | null => {
    const registration = registrationRef.current
    if (!registration) return null

    const table = registration.buildExportTable()

    return {
      pageTitle: pageTitleRef.current,
      columns: table.columns,
      rows: table.rows,
      visibleColumnIds: table.visibleColumnIds,
      isLoading: registration.isLoading,
    }
  }, [])

  const value = useMemo(
    () => ({
      isRegistered,
      isLoading,
      resolvePayload,
      setExportPayload,
    }),
    [isRegistered, isLoading, resolvePayload, setExportPayload]
  )

  return (
    <RapportExportContext.Provider value={value}>
      {children}
    </RapportExportContext.Provider>
  )
}

export function useRapportExport() {
  const context = useContext(RapportExportContext)
  if (!context) {
    throw new Error('useRapportExport must be used within RapportExportProvider')
  }
  return context
}
