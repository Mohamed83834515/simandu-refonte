import type { ModePassation } from './modePassation'
import type { NatureMarche } from './natureMarche'
import type { TypeFinancementPPM } from './typeFinancementPPM'
import type { VersionPPM } from './versionPPM'

export interface Ppm extends Record<string, unknown> {
  id_ppm: number
  intitule_ppm: string
  code_budget: number
  montant_budget: number
  numero_appel_offre: number
  date_enregistrement?: string
  date_modification?: string
  methode_passation?: number | ModePassation | null
  type_financement?: number | TypeFinancementPPM | null
  version_ppm?: number | VersionPPM | null
  nature_marche?: number | NatureMarche | null
}
