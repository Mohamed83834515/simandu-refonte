import { useEffect } from 'react'
import { useRapportExport } from './RapportExportContext'
import type { RapportExportRegistration } from './export/rapportExportTypes'

export function useRapportExportRegistration({
  buildExportTable,
  isLoading = false,
}: RapportExportRegistration) {
  const { setExportPayload } = useRapportExport()

  useEffect(() => {
    setExportPayload({ buildExportTable, isLoading })
    return () => setExportPayload(null)
  }, [buildExportTable, isLoading, setExportPayload])
}
