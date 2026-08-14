import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import type { Localite } from '@/simadou/allTypes/localite'
import type { PartBailleur } from '@/simadou/allTypes/partBailleur'
import {
  type CibleCmrGridCell,
} from '@/simadou/lib/cibleCmrGridUtils'
import {
  resolvePartBailleurRecordId,
  resolvePartRegionId,
  resolvePartTypePartId,
} from '@/simadou/lib/partBailleurUtils'

export type PartBailleurGridCell = CibleCmrGridCell & {
  partId?: number
}

export type PartBailleurGridRow = {
  rowId: string
  label: string
  regionId: number
}

export type PartBailleurGridColumn = {
  columnId: string
  label: string
  typePartId: number
}

export function buildPartBailleurGridRows(
  zones: Localite[] | undefined | null
): PartBailleurGridRow[] {
  return (zones ?? [])
    .filter((zone) => zone.id_loca != null)
    .slice()
    .sort((a, b) =>
      (a.intitule_loca ?? '').localeCompare(b.intitule_loca ?? '', 'fr')
    )
    .map((zone) => ({
      rowId: String(zone.id_loca),
      label: zone.intitule_loca?.trim() || zone.code_loca?.trim() || 'Zone',
      regionId: zone.id_loca,
    }))
}

export function buildPartBailleurGridColumns(
  financements: FinancementProjet[]
): PartBailleurGridColumn[] {
  return financements
    .filter((f) => f.id_part != null)
    .slice()
    .sort((a, b) =>
      (a.intitule ?? '').localeCompare(b.intitule ?? '', 'fr')
    )
    .map((financement) => ({
      columnId: String(financement.id_part),
      label:
        financement.intitule?.trim() ||
        financement.code_type?.trim() ||
        'Financement',
      typePartId: financement.id_part,
    }))
}

export function buildPartBailleurGridKey(
  rowId: string,
  columnId: string
): string {
  return `${rowId}|${columnId}`
}

export function buildPartBailleurGridState({
  parts,
  gridRows,
  gridColumns,
}: {
  parts: PartBailleur[]
  gridRows: PartBailleurGridRow[]
  gridColumns: PartBailleurGridColumn[]
}): Record<string, PartBailleurGridCell> {
  const state: Record<string, PartBailleurGridCell> = {}

  for (const row of gridRows) {
    for (const column of gridColumns) {
      state[buildPartBailleurGridKey(row.rowId, column.columnId)] = {
        value: '',
      }
    }
  }

  for (const part of parts) {
    const regionId = resolvePartRegionId(part)
    const typePartId = resolvePartTypePartId(part)
    if (regionId == null || typePartId == null) continue

    const key = buildPartBailleurGridKey(String(regionId), String(typePartId))
    if (!(key in state)) continue

    state[key] = {
      partId: resolvePartBailleurRecordId(part) ?? undefined,
      value: part.montant == null ? '' : String(part.montant),
    }
  }

  return state
}

export function buildPartBailleurPayloadFromGridCell({
  regionId,
  typePartId,
  montant,
  activitePtbaId,
  projetId,
  annee,
  idPersonnel,
  modifierPar,
}: {
  regionId: number
  typePartId: number
  montant: number
  activitePtbaId: number
  projetId: number
  annee: number
  idPersonnel: number
  modifierPar: number
}) {
  return {
    annee,
    montant,
    observation: '',
    activite_ptba: activitePtbaId,
    projet: projetId,
    region: regionId,
    type_part: typePartId,
    id_personnel: idPersonnel,
    modifier_par: modifierPar,
  }
}

export {
  hasCibleCmrGridChanges as hasPartBailleurGridChanges,
  isCibleCmrGridCellDirty as isPartBailleurGridCellDirty,
  parseGridCellValue,
} from '@/simadou/lib/cibleCmrGridUtils'

export {
  filterPartsForActiviteGrid,
  filterPartsForActiviteGridRelaxed,
} from '@/simadou/lib/partBailleurUtils'
