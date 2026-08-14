import type { Convention } from './convention'
import type { Personnel } from './personnel'

export interface SuiviAvancementConvention extends Record<string, unknown> {
  id_suivi: number
  date_suivi: string
  code_suivi?: string
  etat_avancement: string
  statut_activite: string
  retard_accuse: string
  difficultes_rencontrees: string
  pistes_solutions: string
  observation: string
  date_enregistrement?: string
  etat: string
  modifier_le?: string
  modifier_par?: string
  convention: number | Convention
  id_personnel: number | Personnel
}

export function resolveConventionId(
  ref: number | Convention | undefined | null
): number | undefined {
  if (ref == null) return undefined
  if (typeof ref === 'object') return ref.id_convention
  return ref
}

export function resolvePersonnelId(
  ref: number | Personnel | undefined | null
): number | undefined {
  if (ref == null) return undefined
  if (typeof ref === 'object') return ref.n_personnel
  return ref
}
