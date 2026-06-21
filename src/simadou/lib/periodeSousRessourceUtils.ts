import type {
  DocumentationCmrEnregistrement,
  PeriodeSousRessourceEnregistrement,
  PeriodeSousRessourceType,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'

export function resolvePeriodeEnregistrementId(
  row: PeriodeSousRessourceEnregistrement,
  resource: PeriodeSousRessourceType
): number | null {
  const candidates =
    resource === 'documentations'
      ? [(row as DocumentationCmrEnregistrement).id_documentation, row.id]
      : resource === 'fonds-carte'
        ? [
            (row as { id_fond_carte?: number }).id_fond_carte,
            (row as { id_fonds_carte?: number }).id_fonds_carte,
            row.id,
          ]
        : [(row as { id_tableau_synthese?: number }).id_tableau_synthese, row.id]

  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return null
}

export function resolvePeriodeEnregistrementLabel(
  row: PeriodeSousRessourceEnregistrement,
  resource: PeriodeSousRessourceType
): string {
  if (resource === 'documentations') {
    const doc = row as DocumentationCmrEnregistrement
    if (doc.titre?.trim()) return doc.titre.trim()
  }

  if (row.source_donnees?.trim()) return row.source_donnees.trim()

  return 'Enregistrement'
}
