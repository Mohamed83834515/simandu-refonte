import type { FinancementProjet } from './financementProjet'
import type { Localite } from './localite'

export interface SuiviDecaissementPtbaProjet extends Record<string, unknown> {
  id_suivi_dec: number
  periode_suivi_dec: string
  montant_decaisse: number
  taux_dollars_jour: number
  date_suivi_dec: string
  observation: string
  date_enregistrement?: string | null
  date_modification?: string | null
  region?: number | Localite | null
  type_part?: number | FinancementProjet | null
  activite_ptba_projet: number | null
}
