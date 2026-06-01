import type { Acteur, TypeZone, UniteIndicateur } from '.'

export interface DictionnaireIndicateur extends Record<string, unknown> {
  id_ref_ind_ref: number;
  code_ref_ind: string;
  intitule_ref_ind: string;
  unite_cmr?: UniteIndicateur | null;
  fonction_agregat_cmr?: string;
  echelle?: TypeZone | null;
  typologie?: string;
  seuil_minimum?: number;
  seuil_maximum?: number;
  responsable_collecte_cmr?: Acteur;
  created_at?: string;
  updated_at?: string;
}

/** Payload API création / mise à jour : références par id (pas objets). */
export type DictionnaireIndicateurWritePayload = {
  code_ref_ind: string
  intitule_ref_ind: string
  unite_cmr: number
  fonction_agregat_cmr: string
  echelle: number
  typologie: string
  seuil_minimum: number
  seuil_maximum: number
  responsable_collecte_cmr: number
}
