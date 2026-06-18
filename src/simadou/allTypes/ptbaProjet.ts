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
  montant_decaisse_ptba?:number
}
