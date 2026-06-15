import type { CibleCmrProjet } from '@/simadou/allTypes/cibleCmrProjet'
import type { Localite } from '@/simadou/allTypes/localite'
import type { NiveauLocalite } from '@/simadou/allTypes/niveauLocalite'
import type { Projet } from '@/simadou/allTypes/projet'
import { formatAnneeCibleForApi } from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveRelationCode } from '@/simadou/lib/resolveApiRelation'
import {
  buildCibleCmrGridKey,
  buildCibleCmrGridRows,
  findGridRowByLocaliteId,
  getCibleCmrGridRowId,
  resolveCibleAnnee,
  type CibleCmrGridCell,
  type CibleCmrGridRow,
} from '@/simadou/lib/cibleCmrGridUtils'

export {
  buildCibleCmrGridKey,
  buildCibleCmrGridRows,
  getCibleCmrGridRowId,
  hasCibleCmrGridChanges,
  isCibleCmrGridCellDirty,
  parseGridCellValue,
  type CibleCmrGridCell,
  type CibleCmrGridRow,
} from '@/simadou/lib/cibleCmrGridUtils'

export function getProjetYearRange(projet?: Projet | null): number[] {
  if (!projet?.date_demarrage_projet) return []

  const startYear = new Date(projet.date_demarrage_projet).getFullYear()
  if (!Number.isFinite(startYear)) return []

  const dureeAnnees = projet.duree_projet || 1
  return Array.from({ length: dureeAnnees }, (_, index) => startYear + index)
}

export function resolveCodeIndicateurCrpId(
  cible: CibleCmrProjet | null | undefined
): number | null {
  if (!cible) return null
  if (typeof cible.code_indicateur_crp === 'number') {
    return cible.code_indicateur_crp
  }
  return null
}

export function resolveCibleProjetLocaliteId(
  cible: CibleCmrProjet | null | undefined
): number | null {
  if (!cible?.code_ug) return null
  const raw = cible.code_ug
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Number(raw.trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function resolveCibleProjetCode(
  cible: CibleCmrProjet | null | undefined
): string | null {
  if (!cible?.code_projet) return null
  if (typeof cible.code_projet === 'string') return cible.code_projet.trim() || null
  return resolveRelationCode(cible.code_projet, 'code_projet')
}

export function filterCiblesForProjetZoneGrid(
  cibles: CibleCmrProjet[],
  indicateurCmrProjetId: number,
  codeProjet?: string | null
): CibleCmrProjet[] {
  return cibles.filter((cible) => {
    if (resolveCodeIndicateurCrpId(cible) !== indicateurCmrProjetId) return false
    if (resolveCibleProjetLocaliteId(cible) == null) return false

    if (codeProjet) {
      const cibleProjet = resolveCibleProjetCode(cible)
      if (cibleProjet != null && cibleProjet !== codeProjet) return false
    }

    return true
  })
}

export function buildCibleCmrProjetGridState({
  cibles,
  gridRows,
  years,
}: {
  cibles: CibleCmrProjet[]
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
    const localiteId = resolveCibleProjetLocaliteId(cible)
    const year = resolveCibleAnnee(cible.annee)
    if (localiteId == null || year == null) continue

    const row = findGridRowByLocaliteId(gridRows, localiteId)
    if (!row) continue

    const key = buildCibleCmrGridKey(getCibleCmrGridRowId(row), year)
    if (!(key in state)) continue

    state[key] = {
      cibleId: cible.id_cible_indicateur_crp,
      value:
        cible.valeur_cible_indcateur_crp == null
          ? ''
          : String(cible.valeur_cible_indcateur_crp),
    }
  }

  return state
}

export function buildCibleProjetPayloadFromGridCell({
  localiteId,
  year,
  value,
  indicateurCmrProjetId,
  codeProjet,
}: {
  localiteId: number
  year: number
  value: number
  indicateurCmrProjetId: number
  codeProjet: string
}) {
  return {
    annee: formatAnneeCibleForApi(`${year}-01-01`),
    valeur_cible_indcateur_crp: value,
    code_indicateur_crp: indicateurCmrProjetId,
    code_ug: String(localiteId),
    code_projet: codeProjet,
  }
}

export function buildCibleCmrProjetGridRows(
  localites: Localite[],
  niveaux: NiveauLocalite[]
): CibleCmrGridRow[] {
  return buildCibleCmrGridRows(localites, niveaux)
}
