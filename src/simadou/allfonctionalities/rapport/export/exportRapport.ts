import { toast } from 'sonner'
import type { ExportFormat, RapportExportPayload } from './rapportExportTypes'

export async function exportRapport(
  format: ExportFormat,
  payload: RapportExportPayload
) {
  if (payload.isLoading) {
    toast.info('Les données sont encore en cours de chargement…')
    return
  }

  if (payload.rows.length === 0) {
    toast.warning('Aucune donnée à exporter pour les filtres actuels.')
    return
  }

  try {
    switch (format) {
      case 'excel': {
        const { exportRapportExcel } = await import('./exportRapportExcel')
        await exportRapportExcel(payload)
        break
      }
      case 'pdf': {
        const { exportRapportPdf } = await import('./exportRapportPdf')
        await exportRapportPdf(payload)
        break
      }
      case 'word': {
        const { exportRapportWord } = await import('./exportRapportWord')
        await exportRapportWord(payload)
        break
      }
    }

    toast.success(`Export ${format.toUpperCase()} téléchargé`)
  } catch (error) {
    console.error('Export rapport:', error)
    toast.error("Impossible de générer l'export. Réessayez.")
  }
}
