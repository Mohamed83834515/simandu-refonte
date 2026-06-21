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
  id_fonds_carte?: number
  id?: number
  source_donnees?: string
  date_validation?: string
  shape_file?: string | string[]
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
  document?: string | string[]
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

export interface SousRessourceDocumentsFormData {
  documentFile: File | null
  existingDocument: string
  removeExistingDocument: boolean
}

export interface DocumentationCmrFormData extends SousRessourceDocumentsFormData {
  source_donnees: string
  titre: string
  date_validation: string
  observation: string
}

export interface FondCarteFormData extends SousRessourceDocumentsFormData {
  source_donnees: string
  date_validation: string
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

export interface FondCarteWritePayload {
  source_donnees: string
  date_validation: string
  observation: string
  etat: string
  periode: number
  id_personnel: number
  modifier_par: number
}

export interface DocumentationCmrWritePayload {
  source_donnees: string
  titre: string
  date_validation: string
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

export function isSousRessourceWithDocuments(
  resource: PeriodeSousRessourceType
): resource is 'documentations' | 'fonds-carte' {
  return resource === 'documentations' || resource === 'fonds-carte'
}
