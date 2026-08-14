import type { CadreAnalytique } from './cadreAnalytique'
import type { CibleIndicateurPerformanceProgramme } from './cibleIndicateurPerformanceProgramme'
import type { Programme } from './programme'
import type { UniteIndicateur } from './uniteIndicateur'

export interface IndicateurPerformanceProgramme extends Record<string, unknown> {
  id_indicateur_performance: number
  type_ind: number
  code_indicateur_performance: string
  intitule_indicateur_tache: string
  cadre_analytique?: number | CadreAnalytique | string | null
  unite_indicateur_performance?: number | UniteIndicateur | null
  programme?: number | Programme | null
  cibles?: CibleIndicateurPerformanceProgramme[] | null
}
