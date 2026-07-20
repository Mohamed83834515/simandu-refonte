import { Programme } from "./programme"
import { UGL } from "./ugl"
import { VersionPtba } from "./versionPtba"

export interface ContratPerformance {
  id_contrat?: number
  code_contrat: string
  intitule_contrat: string
  signataire_ministere: string
  date_signature: string
  date_debut: string
  date_fin: string
  statut: string
  note_globale: number | null
  appreciation: string
  observation_globale: string
  etat: string
  version_ptba?: number | null | VersionPtba
  structure?: number | null | UGL
  id_personnel?: number | null
  programme?: number | Programme | null
}

export type ContratPerformancePayload = Omit<
  ContratPerformance,
  'id_contrat'
>
