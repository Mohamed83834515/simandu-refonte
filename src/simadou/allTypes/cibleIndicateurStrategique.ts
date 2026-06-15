export interface CibleIndicateurStrategique {
  id_cible_indicateur_istr: number
  annee: string
  code_indicateur_istr: string | Record<string, unknown>
  code_ug: string | Record<string, unknown>
  valeur_cible_indcateur_istr: number
  code_programme?: string | Record<string, unknown> | null
}
