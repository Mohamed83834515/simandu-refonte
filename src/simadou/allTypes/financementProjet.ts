import type { Acteur } from './acteur'
import type { Projet } from './projet'

export type TypeFinancement = 'pret' | 'don' | 'contribution_etat' | 'contrepartie_etat' | 'contrepartie_beneficiaires'

export interface FinancementProjet {
  id_part: number
  code_type: string
  intitule: string
  montant: number
  date_accord: string
  observation?: string
  date_enregistrement?: string
  etat?: string
  modifier_le?: string
  type_financement: TypeFinancement
  bailleur: number | Acteur
  projet: number | Projet
  id_personnel?: number
  modifier_par?: number
}

export type FinancementProjetApiPayload = {
  code_type: string
  intitule: string
  montant: number
  date_accord: string
  observation?: string
  etat: string
  type_financement: TypeFinancement
  bailleur: number
  projet: number
  id_personnel: number
  modifier_par: number
}
