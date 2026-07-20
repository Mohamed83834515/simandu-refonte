import type { IndicateurContrat } from './indicateurContrat'

export interface SuiviContrat extends Record<string, unknown> {
  id_suivi_contrat: number
  /** Trimestre concerné (ex. « T1 », « 1 », « Trimestre 1 »). */
  trimestre: string
  valeur_realisee: number
  observation: string
  date_enregistrement?: string
  modifier_le?: string
  etat: boolean
  indicateur_contrat: number | IndicateurContrat
  id_personnel?: number
  modifier_par?: number
}

export type SuiviContratPayload = {
  trimestre: string
  valeur_realisee: number
  observation: string
  etat: boolean
  indicateur_contrat: number
  id_personnel: number
}
