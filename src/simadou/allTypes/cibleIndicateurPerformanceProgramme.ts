import type { Programme } from './programme'
import type { IndicateurPerformanceProgramme } from './indicateurPerformanceProgramme'

export interface CibleIndicateurPerformanceProgramme
  extends Record<string, unknown> {
  id_cible_indicateur_performance: number
  annee: number
  budget_an: number
  valeur_cible_indcateur_performance: string | number
  code_indicateur_performance: number | IndicateurPerformanceProgramme
  programme: number | Programme
}

export type CibleIndicateurPerformanceProgrammePayload = {
  annee: number
  budget_an: number
  valeur_cible_indcateur_performance: string | number
  code_indicateur_performance: number
  programme: number
}
