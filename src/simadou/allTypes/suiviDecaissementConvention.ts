import type { Convention } from './convention'

export interface SuiviDecaissementConvention extends Record<string, unknown> {
  id_suivi_dec: number
  montant_decaisse: number
  date_suivi_dec: string
  observation: string
  document_fichier: string | null
  date_enregistrement?: string | null
  date_modification?: string | null
  convention: number | Convention | null
}

export function resolveConventionId(
  ref: number | Convention | undefined | null
): number | undefined {
  if (ref == null) return undefined
  if (typeof ref === 'object') return ref.id_convention
  return ref
}
