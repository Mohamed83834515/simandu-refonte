export interface ZoneCollecte {
  id_zone_collecte: number
  code_zone: string
  nom_zone: string
  shape_file?: File
  type_zone: string
}

export interface ZoneCollecteTable {
  id_zone_collecte: number
  code_zone: string
  nom_zone: string
  shape_file?: string
  type_zone: string
}

export interface ZoneCollecteFormProps {
  zoneCollecte: ZoneCollecte
  setZoneCollecte: (value: ZoneCollecte) => void
  isEdit: boolean
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}