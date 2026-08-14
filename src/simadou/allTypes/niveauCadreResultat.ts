export interface NiveauCadreResultat extends Record<string, unknown> {
  id_ncr: number;
  nombre_ncr: number;
  libelle_ncr: string;
  code_projet: string;
  code_number_ncr: number;
  type_niveau: 1 | 2 | 3; // 1 - Effet, 2 - Produit, 3 - Impact
}

export type NiveauCadreResultatFormData = Omit<NiveauCadreResultat, "id_ncr">;
