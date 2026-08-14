import type { Acteur } from './acteur'
import type { Projet } from './projet'

export interface Convention extends Record<string, unknown> {
  id_convention?: number
  code_convention: string
  intutile_conv: string
  reference_conv: string
  montant_conv: number
  date_signature_conv: string
  etat_conv: string
  document_fichier?: string | null
  partenaire_conv?: number | Partial<Acteur> | null
  projet?: number | Partial<Projet> | null
}

export type ConventionApiPayload = {
  code_convention: string
  intutile_conv: string
  reference_conv: string
  montant_conv: number
  date_signature_conv: string
  etat_conv?: string
  partenaire_conv?: number | null
  projet: number
  document_fichier?: File | string | null
}
