import type { Nbc } from './nbc'

export interface Programme {
  id_programme: number;
  code_programme: string;
  sigle_programme: string;
  nom_programme: string;
  vision_programme: string;
  objectif_programme: string;
  annee_debut_programme: string; // Format: YYYY-MM-DD
  annee_fin_programme: string; // Format: YYYY-MM-DD
  actif_programme: boolean;
  /** Scalar on write; nested object or null on read from API. */
  id_nbc_programme: number | Nbc | null;
}

export type ProgrammeFormData = Omit<
  Programme,
  'id_programme' | 'id_nbc_programme'
>

export interface ProgrammeSelectOption {
  value: number;
  label: string;
  programme: Programme;
}
