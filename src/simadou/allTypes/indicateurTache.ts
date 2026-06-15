// Types spécifiques pour les indicateurs de tâches PTBA

export interface IndicateurTache extends Record<string, unknown> {
  id_indicateur_tache: number;
  intitule_indicateur_tache: string;
  unite_ind_tache: number;
  code_indicateur_ptba: string;
  indicateur_cmr: number; // relation vers IndicateurCmr
  id_activite: number; // relation vers Ptba
  trimestre_1: string;
  trimestre_2: string;
  trimestre_3: string;
  trimestre_4: string;
  created_at?: string;
  updated_at?: string;
}

export interface IndicateurTacheRequest {
  intitule_indicateur_tache: string;
  unite_ind_tache: number;
  code_indicateur_ptba: string;
  indicateur_cmr: number;
  id_activite: number;
  trimestre_1: string;
  trimestre_2: string;
  trimestre_3: string;
  trimestre_4: string;
}
