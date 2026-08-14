import { formatNumber } from '@/simadou/allSercices/montantFormater'
import type { ActiviteProjet } from '@/simadou/allTypes'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes/indicateurPerformanceProjet'
import type { UniteIndicateur } from '@/simadou/allTypes/uniteIndicateur'
import {
  formatIndicateurUniteLabel,
  normalizeIndicateurPerformanceCibles,
} from '@/simadou/lib/indicateurPerformanceUtils'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'
import { SECTION_LABEL_SEPARATOR } from '@/simadou/allfonctionalities/rapport/export/rapportExportUtils'
import type { RapportExportFicheTable } from '@/simadou/allfonctionalities/rapport/export/rapportExportTypes'

const INDENT = '    '

export type PlanAnalytiqueArboRow = {
  /** Libellé activité (avec indent visuel). */
  activite: string
  /** Clé de fusion pour rowspan (id activité). */
  activiteKey: string
  niveau: number
  budget: string
  indicateur: string
  unite: string
  valeurCible: string
  sommeCibles: string
}

function resolveParentActiviteId(activite: ActiviteProjet): number | null {
  return resolveRelationId(activite.parent_activite_projet, 'id_activite_projet')
}

function formatActiviteProjetLabel(activite: ActiviteProjet): string {
  const code = activite.code_activite_projet?.trim()
  const intitule = activite.intitule_activite_projet?.trim() ?? ''
  if (!intitule) return code || '—'
  return code ? `${code}${SECTION_LABEL_SEPARATOR}${intitule}` : intitule
}

function resolveIndicateurActiviteId(
  indicateur: IndicateurPerformanceProjet,
  codeToId?: Map<string, number>
): number | null {
  const fromId = resolveRelationId(indicateur.activite_projet, 'id_activite_projet')
  if (fromId != null) return fromId

  const ref = indicateur.activite_projet
  if (typeof ref === 'string' && codeToId) {
    return codeToId.get(ref) ?? null
  }
  if (ref && typeof ref === 'object') {
    const code = (ref as ActiviteProjet).code_activite_projet
    if (typeof code === 'string' && codeToId) {
      return codeToId.get(code) ?? null
    }
  }
  return null
}

/** Somme des valeurs cibles annuelles d’un indicateur. */
export function getIndicateurCibleSum(
  indicateur: IndicateurPerformanceProjet
): number {
  const cibles = normalizeIndicateurPerformanceCibles(indicateur.cibles)
  if (cibles.length === 0) return 0
  return cibles.reduce((sum, c) => {
    const v = Number(
      c.valeur_cible_indcateur_performance ?? c.valeur_cible ?? 0
    )
    return sum + (Number.isFinite(v) ? v : 0)
  }, 0)
}

/**
 * Parcourt le plan analytique projet en arborescence (parent → enfants),
 * avec les indicateurs de performance au niveau des activités
 * (sans lignes PTBA — adapté du rapport PAO programme).
 */
export function buildPlanAnalytiqueArboRows(
  activites: ActiviteProjet[],
  indicateurs: IndicateurPerformanceProjet[],
  unites: UniteIndicateur[]
): PlanAnalytiqueArboRow[] {
  const ids = new Set(activites.map((a) => a.id_activite_projet))
  const byParent = new Map<number | null, ActiviteProjet[]>()
  for (const a of activites) {
    let parentId = resolveParentActiviteId(a)
    if (parentId != null && !ids.has(parentId)) parentId = null
    const list = byParent.get(parentId) ?? []
    list.push(a)
    byParent.set(parentId, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) =>
      (a.code_activite_projet || '').localeCompare(
        b.code_activite_projet || '',
        'fr'
      )
    )
  }

  const codeToId = new Map(
    activites.map((a) => [a.code_activite_projet, a.id_activite_projet])
  )

  const indicateursByActivite = new Map<number, IndicateurPerformanceProjet[]>()
  for (const ind of indicateurs) {
    const id = resolveIndicateurActiviteId(ind, codeToId)
    if (id == null) continue
    const list = indicateursByActivite.get(id) ?? []
    list.push(ind)
    indicateursByActivite.set(id, list)
  }

  const rows: PlanAnalytiqueArboRow[] = []

  const visit = (parentId: number | null, niveau: number) => {
    const children = byParent.get(parentId) ?? []
    for (const activite of children) {
      const id = activite.id_activite_projet
      const label =
        INDENT.repeat(niveau) + formatActiviteProjetLabel(activite)
      const budget =
        activite.budget != null && Number.isFinite(Number(activite.budget))
          ? formatNumber(Number(activite.budget))
          : '—'
      const inds = indicateursByActivite.get(id) ?? []
      const somme = inds.reduce((s, ind) => s + getIndicateurCibleSum(ind), 0)
      const sommeLabel = inds.length > 0 ? formatNumber(somme) : '—'
      const activiteKey = `act-${id}`

      if (inds.length === 0) {
        rows.push({
          activite: label,
          activiteKey,
          niveau,
          budget,
          indicateur: '—',
          unite: '—',
          valeurCible: '—',
          sommeCibles: sommeLabel,
        })
      } else {
        for (const ind of inds) {
          const cible = getIndicateurCibleSum(ind)
          rows.push({
            activite: label,
            activiteKey,
            niveau,
            budget,
            indicateur: ind.intitule_indicateur_tache?.trim() || '—',
            unite: formatIndicateurUniteLabel(ind, unites),
            valeurCible: cible > 0 ? formatNumber(cible) : '—',
            sommeCibles: sommeLabel,
          })
        }
      }

      visit(id, niveau + 1)
    }
  }

  visit(null, 0)
  return rows
}

export function buildPlanAnalytiqueArboTable(
  activites: ActiviteProjet[],
  indicateurs: IndicateurPerformanceProjet[],
  unites: UniteIndicateur[]
): RapportExportFicheTable {
  const arbo = buildPlanAnalytiqueArboRows(activites, indicateurs, unites)
  return {
    title: 'Plan analytique (arborescence)',
    description:
      'Activités du plan analytique en arborescence, avec indicateurs de performance (budget, unité, valeurs cibles).',
    headers: [
      'Activité',
      'Budget (GNF)',
      'Intitulé indicateur',
      'Unité',
      'Valeur cible',
      'Somme des cibles',
    ],
    rows: arbo.length
      ? arbo.map((r) => [
          r.activite,
          r.budget,
          r.indicateur,
          r.unite,
          r.valeurCible,
          r.sommeCibles,
        ])
      : [['—', 'Aucune activité', '', '', '', '']],
    mergeFirstColumn: true,
    boldPrefixSeparator: SECTION_LABEL_SEPARATOR,
  }
}
