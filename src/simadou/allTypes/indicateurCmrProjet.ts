import type { CadreResultat } from '@/simadou/allTypes'
import type { DictionnaireIndicateur } from './dictionnaireIndicateur'
import type { IndicateurCadreResultat } from './indicateurCadreResultat'
import type { Projet } from './projet'

export interface IndicateurCmrProjet extends Record<string, unknown> {
  id_ref_ind_cmr: number
  code_ref_ind: string
  resultat_cmr?: number | CadreResultat | null
  indicateur_iop?: number | IndicateurCadreResultat | null
  intitule_ref_ind: string
  reference_cmr: string
  annee_reference: number
  responsable_collecte_cmr: string
  cible_cmr: string
  fonction_agregat_cmr: string
  referentiel_cmr?: number | DictionnaireIndicateur | null
  code_projet?: string | Projet | null
  created_at?: string
  updated_at?: string
}

export type IndicateurCmrProjetFormData = Omit<
  IndicateurCmrProjet,
  'id_ref_ind_cmr'
>
