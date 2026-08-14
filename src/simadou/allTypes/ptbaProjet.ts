import type { ActiviteProjet } from './activiteProjet'
import type { Projet } from './projet'
import type { Ptba } from './ptba'
import { VersionPtba } from './versionPtba'

/** PTBA rattaché à un projet (endpoint /ptbas-projets/). */
export interface PtbaProjet extends Ptba {
  /** Relation vers activite_projet via id_activite_projet (champ API : code_actvite_projet). */
  code_actvite_projet?: number | ActiviteProjet | null
  code_projet?: string | Projet | null
  cout_ptba?: number;
  version_info?: VersionPtba 
  delais?:number| string
  montant_decaisse_ptba?:number
  taux_decaissement_ptba?: number
  ugl_ptba?: string
  communes_ptba?: number[]
  source_financement_ptba?: number | null
}

/** Réponse GET /versions-ptbas/{id}/ptbas-projets/ */
export interface VersionPtbasProjetsResponse {
  version: VersionPtba
  nb_ptbas_projets: number
  ptbas_projets: PtbaProjet[]
}
