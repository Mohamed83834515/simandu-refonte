import type { CadreLogiqueClcp } from './cadreLogiqueClcp'

export interface IndicateurContrat extends Record<string, unknown> {
  id_indicateur_contrat: number
  intitule_indicateur: string
  valeur_reference: number
  cible_t1?: string
  cible_t2?: string
  cible_t3?: string
  cible_t4?: string
  moyen_verification?: string
  date_enregistrement?: string
  etat: boolean
  clcp: number | CadreLogiqueClcp
  unite: number
  id_personnel?: number
}

export type IndicateurContratPayload = {
  intitule_indicateur: string
  valeur_reference: number
  cible_t1?: string
  cible_t2?: string
  cible_t3?: string
  cible_t4?: string
  moyen_verification?: File | string | null
  etat: boolean
  clcp: number
  unite: number
  id_personnel: number
}
