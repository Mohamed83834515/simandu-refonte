// Types spécifiques pour les indicateurs de tâches PTBA

export interface IndicateurTache extends Record<string, unknown> {
  id_indicateur_tache: number;
  intitule_indicateur_tache: string;
  unite_ind_tache: number;
  code_indicateur_ptba: string;
  indicateur_cmr: number; // relation vers IndicateurCmr
  id_activite: number; // relation vers Ptba
  trimestre_1: number;
  trimestre_2: number;
  trimestre_3: number;
  trimestre_4: number;
  valeur_cible?: number | null;
  valeur_realisee?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface IndicateurTacheRequest {
  intitule_indicateur_tache: string;
  unite_ind_tache: number;
  code_indicateur_ptba: string;
  indicateur_cmr: number;
  id_activite: number;
  trimestre_1: number;
  trimestre_2: number;
  trimestre_3: number;
  trimestre_4: number;
}
