export interface NiveauConfigClcp extends Record<string, unknown> {
  id_niveau_ncl: number
  code_number_ncl: string
  nombre_ncl: number
  date_enregistrement?: string
  etat: boolean
  contrat: number
  id_personnel?: number
}

export type NiveauConfigClcpPayload = {
  code_number_ncl: string
  nombre_ncl: number
  etat: boolean
  contrat: number
  id_personnel: number
}
