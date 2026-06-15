import type { IndicateurCmr } from './indicateurCmr'
import type { Localite } from './localite'

export interface CibleCmr extends Record<string, unknown> {
  id_cible_indicateur_crp: number
  annee: number
  valeur_cible_indcateur_cmr: number
  code_indicateur_cmr?: number | IndicateurCmr | null
  localite?: number | Localite | null
  programme?: string | null
}
