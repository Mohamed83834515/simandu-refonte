import type { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import type { CibleIndicateurPerformanceProgramme } from '@/simadou/allTypes/cibleIndicateurPerformanceProgramme'
import type { IndicateurPerformanceProgramme } from '@/simadou/allTypes/indicateurPerformanceProgramme'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export type CibleAnnuelleProgrammeFormValue = {
  annee: number
  valeur_cible: number
  budget_an: number
  id_cible_indicateur_performance?: number
}

export function normalizeIndicateurPerformanceProgrammeCibles(
  cibles: IndicateurPerformanceProgramme['cibles']
): CibleIndicateurPerformanceProgramme[] {
  if (!cibles) return []
  if (Array.isArray(cibles)) return cibles
  return [cibles]
}

export function resolveCadreAnalytiqueId(
  value: IndicateurPerformanceProgramme['cadre_analytique']
): number | null {
  return resolveRelationId(value, 'id_ca')
}

export function filterIndicateursByCadreAnalytique(
  indicateurs: IndicateurPerformanceProgramme[],
  cadre: CadreAnalytique
): IndicateurPerformanceProgramme[] {
  return indicateurs.filter((indicateur) => {
    const cadreId = resolveCadreAnalytiqueId(indicateur.cadre_analytique)
    if (cadreId != null && cadreId === cadre.id_ca) return true

    const cadreRef = indicateur.cadre_analytique
    if (typeof cadreRef === 'string') return cadreRef === cadre.code_ca

    return false
  })
}

export function attachCiblesToIndicateursProgramme(
  indicateurs: IndicateurPerformanceProgramme[],
  cibles: CibleIndicateurPerformanceProgramme[]
): IndicateurPerformanceProgramme[] {
  const ciblesByIndicateurId = new Map<number, CibleIndicateurPerformanceProgramme[]>()

  for (const cible of cibles) {
    const indicateurId = resolveRelationId(
      cible.code_indicateur_performance,
      'id_indicateur_performance'
    )
    if (indicateurId == null) continue
    const current = ciblesByIndicateurId.get(indicateurId) ?? []
    current.push(cible)
    ciblesByIndicateurId.set(indicateurId, current)
  }

  return indicateurs.map((indicateur) => ({
    ...indicateur,
    cibles: ciblesByIndicateurId.get(indicateur.id_indicateur_performance) ?? [],
  }))
}

export function buildIndicateurCountByCadreAnalytiqueId(
  indicateurs: IndicateurPerformanceProgramme[],
  cadres: CadreAnalytique[]
): Map<number, number> {
  const codeById = new Map(cadres.map((cadre) => [cadre.id_ca, cadre.code_ca]))
  const counts = new Map<number, number>()

  for (const indicateur of indicateurs) {
    const cadreId = resolveCadreAnalytiqueId(indicateur.cadre_analytique)
    let targetId = cadreId

    if (targetId == null && typeof indicateur.cadre_analytique === 'string') {
      const match = cadres.find(
        (cadre) => cadre.code_ca === indicateur.cadre_analytique
      )
      targetId = match?.id_ca ?? null
    }

    if (targetId == null) continue
    counts.set(targetId, (counts.get(targetId) ?? 0) + 1)
    if (codeById.has(targetId)) continue
  }

  return counts
}

export function getCibleProgrammeValueForYear(
  indicateur: IndicateurPerformanceProgramme,
  year: number
): number | null {
  const cible = normalizeIndicateurPerformanceProgrammeCibles(indicateur.cibles).find(
    (item) => item.annee === year
  )
  if (!cible) return null

  const value = Number(cible.valeur_cible_indcateur_performance ?? 0)
  return Number.isFinite(value) && value !== 0 ? value : null
}

export function getBudgetProgrammeValueForYear(
  indicateur: IndicateurPerformanceProgramme,
  year: number
): number | null {
  const cible = normalizeIndicateurPerformanceProgrammeCibles(indicateur.cibles).find(
    (item) => item.annee === year
  )
  if (!cible) return null

  const value = Number(cible.budget_an ?? 0)
  return Number.isFinite(value) && value !== 0 ? value : null
}

export function hasCibleProgrammeValues(
  cibles: CibleAnnuelleProgrammeFormValue[]
): boolean {
  return cibles.some(
    (cible) =>
      (cible.valeur_cible != null && cible.valeur_cible > 0) ||
      (cible.budget_an != null && cible.budget_an > 0)
  )
}
