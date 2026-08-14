import { CadreAnalytique } from "./cadreAnalytique";

export interface CadreAnalytiqueComposante {
  id_ca: number;
  code_ca: string;
  intutile_ca: string;
  niveau_ca: number | string;
  parent_ca: CadreAnalytique;
  nombre_niveau_inferieur: number;
  nb_ptbas: number;
  cout_total_ptba: number;
  montant_decaisse_ptba: number;
  taux_execution_ptba_moyen: number;
  taux_decaissement_ptba_moyen: number;
  taux_realisation_indicateurs_taches_moyen: number;
  delais: string;
}

export interface NiveauCadreAnalytiqueComposante extends Record<string, unknown> {
  nombre_nca: number;
  code_programme: number;
  nb_cadres_analytiques: number;
  nb_ptbas: number;
  cadres_analytiques: CadreAnalytiqueComposante[];
}