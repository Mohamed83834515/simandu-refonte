/**
 * Suivi indicateur tâche.
 * - Programme: GET/POST /suivis-indicateurs-taches/
 * - Projet: GET/POST /suivi-indicateur-tache-projets/
 *
 * - personnel_sit: id du personnel qui a enregistré le suivi
 * - tache_suivi / ugl_sit: réservés (à brancher plus tard)
 */
export interface SuiviIndicateurTache extends Record<string, unknown> {
  id_suivi_sit: number
  valeur_suivi_sit: number
  date_suivi_sit: string
  tache_suivi?: string | null
  personnel_sit?: number | null
  ugl_sit?: number | null
  commune_sit?: number | null
  indicateur_sit?: number | null
}

export type SuiviIndicateurTacheProjet = SuiviIndicateurTache
