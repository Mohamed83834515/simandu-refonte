import type { Acteur } from './acteur'
import type { Programme } from '.'

export interface CadreAnalytique {
  id_ca: number;
  code_ca: string;
  intutile_ca: string;
  abgrege_ca: string;
  niveau_ca: number | string;
  cout_axe: number;
  partenaire_ca: number[] | Acteur[] | number | Acteur | null;
  parent_ca: number | CadreAnalytique | null;
  programme_ca: number | Programme | null;
}

export interface NiveauCadreAnalytique extends Record<string, unknown> {
  id_nca: number;
  nombre_nca: number;
  libelle_nca: string;
  code_number_nca: number;
  programme?: string | Programme;
}
