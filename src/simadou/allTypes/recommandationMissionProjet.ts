import type { Acteur } from './acteur'
import type { MissionSupervisionProjet } from './missionSupervisionProjet'
import type { Personnel } from './personnel'
import type { Projet } from './projet'

export type RecommandationMissionProjet = {
  id_recommandation: number
  volet_recommandation?: string
  rubrique?: string
  numero?: string
  ref_no?: string
  date_buttoir?: string
  recommandation?: string
  type_recommandation?: string
  observation?: string
  rapport?: string | File
  date_enregistrement?: string
  etat?: string
  modifier_le?: string | null
  modifier_par?: number
  mission?: number | MissionSupervisionProjet
  responsable?: number | Personnel
  responsable_interne?: number | Personnel
  projet?: number | Projet
  structure?: number | Acteur
  id_personnel?: number
}

export type RecommandationMissionProjetApiPayload = {
  volet_recommandation: string
  rubrique: string
  numero: string
  ref_no: string
  date_buttoir: string
  recommandation: string
  type_recommandation: string
  observation: string
  rapport?: string
  etat: string
  modifier_le: string
  modifier_par: number
  mission: number
  responsable: number
  responsable_interne: number
  projet: number
  structure: number
  id_personnel: number
}
