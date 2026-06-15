import type { Personnel } from './personnel'
import type { Ptba } from './ptba'

export interface CoutUnitairePtba extends Record<string, unknown> {
  id_cout_unitaire: number
  prix_unitaire: number
  quantite_cu: number
  unite_cu: string
  intitule_tache: string
  ordre: number
  annee: number
  id_personnel: number | Personnel
  date_enregistrement?: string
  etat: boolean
  modifier_le?: string
  modifier_par?: number
  ptba_activite: number | Ptba
}
