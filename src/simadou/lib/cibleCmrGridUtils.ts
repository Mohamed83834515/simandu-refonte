import type { CibleCmr } from '@/simadou/allTypes/cibleCmr'
import type { Localite } from '@/simadou/allTypes/localite'
import type { NiveauLocalite } from '@/simadou/allTypes/niveauLocalite'
import type { Programme } from '@/simadou/allTypes/programme'
import {
  resolveRelationCode,
  resolveRelationId,
} from '@/simadou/lib/resolveApiRelation'

export type CibleCmrGridCell = {
  cibleId?: number
  value: string
}

export type CibleCmrGridRow = {
  rowId: string
  label: string
  localiteId: number
}

export function resolveCibleAnnee(
  annee: number | string | null | undefined
): number | null {
  if (typeof annee === 'number' && Number.isFinite(annee)) return annee
  if (typeof annee === 'string' && annee.trim()) {
    const yearMatch = annee.match(/^(\d{4})/)
    if (yearMatch) return Number(yearMatch[1])
    const parsed = new Date(annee)
    if (Number.isFinite(parsed.getTime())) return parsed.getFullYear()
  }
  return null
}

export function resolveCodeIndicateurCmrId(
  cible: CibleCmr | null | undefined
): number | null {
  if (!cible) return null
  return (
    resolveRelationId(cible.code_indicateur_cmr, 'id_ref_ind_cmr') ??
    (typeof cible.code_indicateur_cmr === 'number'
      ? cible.code_indicateur_cmr
      : null)
  )
}

export function resolveCibleLocaliteId(
  cible: CibleCmr | null | undefined
): number | null {
  if (!cible) return null
  return resolveRelationId(cible.localite, 'id_loca')
}

export function resolveCibleProgrammeCode(
  cible: CibleCmr | null | undefined
): string | null {
  if (!cible?.programme) return null
  if (typeof cible.programme === 'string') return cible.programme.trim() || null
  return resolveRelationCode(cible.programme, 'code_programme')
}

export function getLocalitesByNombreNlc(
  localites: Localite[],
  niveaux: NiveauLocalite[] = [],
  nombreNlc: number
): Localite[] {
  const niveauConfig = niveaux.find((n) => Number(n.nombre_nlc) === nombreNlc)

  return localites
    .filter((localite) => {
      const niveau = localite.niveau_loca
      if (typeof niveau === 'object' && niveau !== null) {
        if (Number(niveau.nombre_nlc) === nombreNlc) return true
        if (niveauConfig?.id_nlc != null && niveau.id_nlc === niveauConfig.id_nlc) {
          return true
        }
        return false
      }
      if (typeof niveau === 'number' && niveauConfig?.id_nlc != null) {
        return niveau === niveauConfig.id_nlc
      }
      if (nombreNlc === 1 && localite.parent_loca == null) return true
      return resolveLocaliteNiveauNombre(localite) === nombreNlc
    })
    .sort((a, b) => a.intitule_loca.localeCompare(b.intitule_loca, 'fr'))
}

/** Zones = localités de second niveau (préfectures, nombre_nlc === 2). */
export function getLocalitesZones(
  localites: Localite[],
  niveaux: NiveauLocalite[] = []
): Localite[] {
  return getLocalitesByNombreNlc(localites, niveaux, 2)
}

/** @deprecated Utiliser getLocalitesZones — conservé pour compatibilité. */
export function getLocalitesNiveau1(
  localites: Localite[],
  niveaux: NiveauLocalite[] = []
): Localite[] {
  return getLocalitesZones(localites, niveaux)
}

export function buildCibleCmrGridRows(
  localites: Localite[],
  niveaux: NiveauLocalite[]
): CibleCmrGridRow[] {
  return getLocalitesZones(localites, niveaux).map((localite) => ({
    rowId: String(localite.id_loca),
    label: localite.intitule_loca,
    localiteId: localite.id_loca,
  }))
}

export function getCibleCmrGridRowId(row: CibleCmrGridRow): string {
  return row.rowId
}

export function findGridRowByLocaliteId(
  gridRows: CibleCmrGridRow[],
  localiteId: number
): CibleCmrGridRow | undefined {
  return gridRows.find((row) => row.localiteId === localiteId)
}

export function parseProgrammeYear(
  value: string | null | undefined
): number | null {
  if (!value?.trim()) return null
  const parsed = new Date(value)
  if (Number.isFinite(parsed.getTime())) return parsed.getFullYear()
  const match = value.match(/^(\d{4})/)
  return match ? Number(match[1]) : null
}

export function getProgrammeYearRange(programme?: Programme | null): number[] {
  const startYear = parseProgrammeYear(programme?.annee_debut_programme)
  const endYear = parseProgrammeYear(programme?.annee_fin_programme)
  if (startYear == null || endYear == null) return []

  const from = Math.min(startYear, endYear)
  const to = Math.max(startYear, endYear)
  const years: number[] = []
  for (let year = from; year <= to; year += 1) {
    years.push(year)
  }
  return years
}

export function resolveLocaliteNiveauNombre(
  localite: Localite
): number | null {
  const niveau = localite.niveau_loca
  if (typeof niveau === 'object' && niveau !== null) {
    return Number(niveau.nombre_nlc)
  }
  return null
}

export function buildCibleCmrGridKey(rowId: string, year: number): string {
  return `${rowId}|${year}`
}

/** Cibles affichées dans la grille zone × année (politique / programme). */
export function filterCiblesForZoneGrid(
  cibles: CibleCmr[],
  indicateurCmrId: number,
  programmeCode?: string | null
): CibleCmr[] {
  return cibles.filter((cible) => {
    if (resolveCodeIndicateurCmrId(cible) !== indicateurCmrId) return false
    if (resolveCibleLocaliteId(cible) == null) return false

    if (programmeCode) {
      const cibleProgramme = resolveCibleProgrammeCode(cible)
      if (cibleProgramme != null && cibleProgramme !== programmeCode) {
        return false
      }
    }

    return true
  })
}

export function buildCibleCmrGridState({
  cibles,
  gridRows,
  years,
}: {
  cibles: CibleCmr[]
  gridRows: CibleCmrGridRow[]
  years: number[]
}): Record<string, CibleCmrGridCell> {
  const state: Record<string, CibleCmrGridCell> = {}

  for (const row of gridRows) {
    const rowId = getCibleCmrGridRowId(row)
    for (const year of years) {
      state[buildCibleCmrGridKey(rowId, year)] = { value: '' }
    }
  }

  for (const cible of cibles) {
    const localiteId = resolveCibleLocaliteId(cible)
    const year = resolveCibleAnnee(cible.annee)
    if (localiteId == null || year == null) continue

    const row = findGridRowByLocaliteId(gridRows, localiteId)
    if (!row) continue

    const key = buildCibleCmrGridKey(getCibleCmrGridRowId(row), year)
    if (!(key in state)) continue

    state[key] = {
      cibleId: cible.id_cible_indicateur_crp,
      value:
        cible.valeur_cible_indcateur_cmr == null
          ? ''
          : String(cible.valeur_cible_indcateur_cmr),
    }
  }

  return state
}

export function parseGridCellValue(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

export function buildCiblePayloadFromGridCell({
  localiteId,
  year,
  value,
  indicateurCmrId,
  programmeCode = null,
}: {
  localiteId: number
  year: number
  value: number
  indicateurCmrId: number
  programmeCode?: string | null
}) {
  return {
    annee: year,
    valeur_cible_indcateur_cmr: value,
    code_indicateur_cmr: indicateurCmrId,
    localite: localiteId,
    programme: programmeCode?.trim() || null,
  }
}

export function isCibleCmrGridCellDirty(
  grid: Record<string, CibleCmrGridCell>,
  initialGrid: Record<string, CibleCmrGridCell>,
  key: string
): boolean {
  return (grid[key]?.value ?? '') !== (initialGrid[key]?.value ?? '')
}

export function hasCibleCmrGridChanges(
  grid: Record<string, CibleCmrGridCell>,
  initialGrid: Record<string, CibleCmrGridCell>
): boolean {
  const keys = new Set([...Object.keys(grid), ...Object.keys(initialGrid)])
  for (const key of keys) {
    if (isCibleCmrGridCellDirty(grid, initialGrid, key)) return true
  }
  return false
}