import { type Programme } from "./programme";

export interface NiveauCadreStrategique extends Record<string, unknown> {
  id_nsc: number;
  nombre_nsc: number;
  libelle_nsc: string;
  code_number_nsc: number;
  type_niveau: 1 | 2 | 3 | string; // 1 - Effet, 2 - Produit, 3 - Impact
  programme?: string | Programme;
}
