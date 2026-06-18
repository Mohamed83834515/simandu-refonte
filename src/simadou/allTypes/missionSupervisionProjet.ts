import type { Projet } from './projet'

export type MissionSupervisionProjet = {
  id_mission: number
  code_ms: string
  type_mission?: string
  objet?: string
  resume?: string
  debut: string
  fin: string
  observation?: string
  projection?: string
  document?: string | File
  date_enregistrement?: string
  etat?: string
  modifier_le?: string | null
  modifier_par?: number
  projet?: number | Projet
  id_personnel?: number
}

export type MissionSupervisionProjetApiPayload = {
  code_ms: string
  type_mission?: string
  objet?: string
  resume?: string
  debut: string
  fin: string
  observation?: string
  projection?: string
  etat?: string
  modifier_le?: string
  modifier_par?: number
  projet: number
  id_personnel?: number
}
