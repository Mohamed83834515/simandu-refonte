import type { Projet } from './projet'
import type { PtbaProjet } from './ptbaProjet'
import type { FinancementProjet } from './financementProjet'
import type { Localite } from './localite'

export interface PartBailleur {
  id_part: number
  annee: number
  montant: number
  observation?: string
  date_enregistrement?: string
  modifier_le?: string
  activite_ptba: number | PtbaProjet
  projet: number | Projet
  region: number | Localite
  type_part: number | FinancementProjet
  id_personnel?: number
  modifier_par?: number
}

export type PartBailleurApiPayload = {
  annee: number
  montant: number
  observation?: string
  activite_ptba: number
  projet: number
  region: number
  type_part: number
  id_personnel: number
  modifier_par: number
}
