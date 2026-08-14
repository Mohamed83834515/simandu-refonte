import { type NiveauCadreResultat } from './niveauCadreResultat'

export interface CadreResultat extends Record<string, unknown> {
  id_cr: number
  code_cr: string
  intutile_cr: string
  abgrege_cr: string
  date_enregistrement: string // Géré auto par le backend
  date_modification: string // Géré auto par le backend
  etat?: string | null
  niveau_cr?: NiveauCadreResultat | number | null
  parent_cr?: string | number | null
  projet_cr?: string | number | null
  // Relations populées
  niveau?: NiveauCadreResultat | null
  parent?: CadreResultat | null
}

export type CadreResultatFormData = Omit<
  CadreResultat,
  'id_cr' | 'date_enregistrement' | 'date_modification'
>
