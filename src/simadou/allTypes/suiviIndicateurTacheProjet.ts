export interface SuiviIndicateurTacheProjet extends Record<string, unknown> {
  id_suivi_sit: number
  valeur_suivi_sit: number
  date_suivi_sit: string
  tache_suivi?: string | null
  personnel_sit?: number | null
  ugl_sit?: number | null
  commune_sit?: number | null
  indicateur_sit?: number | null
}
