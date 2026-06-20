export type PeriodeSousRessourceType =
  | 'documentations'
  | 'fonds-carte'
  | 'tableaux-synthese'

export interface TableauSyntheseEnregistrement {
  id_tableau_synthese?: number
  id?: number
  source_donnees?: string
  date_validation?: string
  observation?: string
  etat?: string
  periode?: number
  id_personnel?: number
  modifier_par?: number
}

export interface FondCarteEnregistrement {
  id_fond_carte?: number
  id?: number
  source_donnees?: string
  date_validation?: string
  observation?: string
  etat?: string
  periode?: number
  id_personnel?: number
  modifier_par?: number
}

export interface DocumentationCmrEnregistrement {
  id_documentation?: number
  id?: number
  source_donnees?: string
  titre?: string
  date_validation?: string
  document?: string
  observation?: string
  etat?: string
  periode?: number
  id_personnel?: number
  modifier_par?: number
}

export type PeriodeSousRessourceEnregistrement =
  | TableauSyntheseEnregistrement
  | FondCarteEnregistrement
  | DocumentationCmrEnregistrement

export interface SimpleSousRessourceFormData {
  source_donnees: string
  date_validation: string
  observation: string
}

export interface DocumentationCmrFormData {
  source_donnees: string
  titre: string
  date_validation: string
  document: string
  observation: string
}

export interface SimpleSousRessourceWritePayload {
  source_donnees: string
  date_validation: string
  observation: string
  etat: string
  periode: number
  id_personnel: number
  modifier_par: number
}

export type TableauSyntheseWritePayload = SimpleSousRessourceWritePayload
export type FondCarteWritePayload = SimpleSousRessourceWritePayload

export interface DocumentationCmrWritePayload {
  source_donnees: string
  titre: string
  date_validation: string
  document: string
  observation: string
  etat: string
  periode: number
  id_personnel: number
  modifier_par: number
}

export type PeriodeSousRessourceWritePayload =
  | TableauSyntheseWritePayload
  | FondCarteWritePayload
  | DocumentationCmrWritePayload

export const PERIODE_SOUS_RESSOURCE_LABELS: Record<
  PeriodeSousRessourceType,
  string
> = {
  documentations: 'documentation',
  'fonds-carte': 'fonds de carte',
  'tableaux-synthese': 'tableau de synthèse',
}
