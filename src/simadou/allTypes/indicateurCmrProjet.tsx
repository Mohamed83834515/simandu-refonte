export interface IndicateurCmrProjet extends Record<string, unknown> {
  id_ref_ind_cmr: number;
  code_ref_ind: string;
  resultat_cmr: number;
  intitule_ref_ind: string;
  reference_cmr: string;
  annee_reference: number;
  responsable_collecte_cmr: string;
  cible_cmr: string;
  fonction_agregat_cmr: string;
  referentiel_cmr?: number;
  created_at?: string;
  updated_at?: string;
}

export type IndicateurCmrFormData = Omit<IndicateurCmrProjet, "id_ref_ind_cmr">;
