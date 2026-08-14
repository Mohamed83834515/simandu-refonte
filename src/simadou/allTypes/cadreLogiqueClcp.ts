import type { NiveauConfigClcp } from './niveauConfigClcp'

export interface CadreLogiqueClcp extends Record<string, unknown> {
  id_clc: number
  code_clc: string
  niveau_clc: number | NiveauConfigClcp
  intitule_clc: string
  date_enregistrement?: string
  etat: boolean
  contrat: number
  parent_clc?: number | CadreLogiqueClcp | null
  id_personnel?: number
}

export type CadreLogiqueClcpPayload = {
  code_clc: string
  niveau_clc: number
  intitule_clc: string
  etat: boolean
  contrat: number
  parent_clc?: number | null
  id_personnel: number
}
