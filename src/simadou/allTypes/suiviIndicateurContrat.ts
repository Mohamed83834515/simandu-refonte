export const TRIMESTRE_OPTIONS = [
  { value: 'trimestre_1', label: 'Trimestre 1' },
  { value: 'trimestre_2', label: 'Trimestre 2' },
  { value: 'trimestre_3', label: 'Trimestre 3' },
  { value: 'trimestre_4', label: 'Trimestre 4' },
] as const

export type TrimestreSuiviIndicateurContrat =
  (typeof TRIMESTRE_OPTIONS)[number]['value']

export interface SuiviIndicateurContrat extends Record<string, unknown> {
  id_suivi_contrat: number
  trimestre: TrimestreSuiviIndicateurContrat | string
  valeur_realisee: number
  observation: string
  date_enregistrement?: string
  modifier_le?: string
  etat: boolean
  indicateur_contrat: number
  id_personnel?: number | null
  modifier_par?: number | null
}

export type SuiviIndicateurContratPayload = {
  trimestre: TrimestreSuiviIndicateurContrat | string
  valeur_realisee: number
  observation: string
  etat: boolean
  indicateur_contrat: number
  id_personnel: number
  modifier_par: number
}
