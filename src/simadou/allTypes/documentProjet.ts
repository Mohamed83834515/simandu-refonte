import type { Projet } from './projet'

export interface DocumentProjet extends Record<string, unknown> {
  id_document: number
  document: string
  description_document?: string
  projet: number | Projet
}
