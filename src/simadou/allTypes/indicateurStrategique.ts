export interface IndicateurStrategique {
  id_indicateur_str: number
  niveau_istr: number
  code_indicateur_istr: string
  code_istr: string | number
  intitule_indicateur_istr: string
  periodicite_iop: string
  source_istr: string
  responsable_istr: string
  description_istr: string
  structure_istr: string | null
  /** API write: code programme ; read: objet Programme ou null */
  programme_istr: string | number | Record<string, unknown> | null
}
