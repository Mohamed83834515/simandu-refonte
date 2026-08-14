export interface PeriodeIndicateur {
  id_periode: number
  periode_collecte: string
  source_donnees: string
  date_validation: string
  valeur_periode: number
  observation: string
  date_enregistrement: string
  etat: string
  modifier_le: string
  ref_indicateur: number
  id_personnel: number
  modifier_par: number
  periode?: number
}

export type PeriodeIndicateurFormData = Pick<
  PeriodeIndicateur,
  | 'periode_collecte'
  | 'source_donnees'
  | 'date_validation'
  | 'valeur_periode'
  | 'observation'
>

export type PeriodeIndicateurWritePayload = PeriodeIndicateur
