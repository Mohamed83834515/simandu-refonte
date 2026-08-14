import type { Projet } from './projet'

export interface DossierProjet {
  id_dossier: number
  nom_dossier: string
  description_dossier?: string
  projet: number | Projet
}

export type DossierProjetWritePayload = {
  nom_dossier: string
  description_dossier?: string
  projet: number
}
