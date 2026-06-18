import type {
  ActiviteProjet,
  CibleIndicateurPerformanceProjet,
  IndicateurPerformanceProjet,
  UniteIndicateur,
} from '@/simadou/allTypes'

export function normalizeIndicateurPerformanceCibles(
  cibles: IndicateurPerformanceProjet['cibles']
): CibleIndicateurPerformanceProjet[] {
  if (!cibles) return []
  if (Array.isArray(cibles)) return cibles
  return [cibles]
}

export function getCibleValueForYear(
  indicateur: IndicateurPerformanceProjet,
  year: number
): number | null {
  const cible = normalizeIndicateurPerformanceCibles(indicateur.cibles).find(
    (item) => item.annee === year
  )
  if (!cible) return null

  const value = Number(
    cible.valeur_cible_indcateur_performance ?? cible.valeur_cible ?? 0
  )
  return Number.isFinite(value) && value !== 0 ? value : null
}

export function getBudgetValueForYear(
  indicateur: IndicateurPerformanceProjet,
  year: number
): number | null {
  const cible = normalizeIndicateurPerformanceCibles(indicateur.cibles).find(
    (item) => item.annee === year
  )
  if (!cible) return null

  const value = Number(cible.budget_an ?? 0)
  return Number.isFinite(value) && value !== 0 ? value : null
}

export function formatIndicateurUniteLabel(
  indicateur: IndicateurPerformanceProjet,
  unites: UniteIndicateur[]
): string {
  const v = indicateur.unite_indicateur_performance
  const id =
    typeof v === 'number'
      ? v
      : v && typeof v === 'object' && 'id_unite' in v
        ? Number((v as UniteIndicateur).id_unite)
        : null

  if (id == null) return '—'

  const unite = unites.find((u) => u.id_unite === id)
  if (unite) return unite.unite_ui

  if (v && typeof v === 'object' && 'unite_ui' in v) {
    return String((v as UniteIndicateur).unite_ui)
  }

  return String(id)
}

export function formatCibleDisplayValue(value: number | null): string {
  return value == null ? '' : String(value)
}

export function buildIndicateurCountByActiviteCode(
  indicateurs: IndicateurPerformanceProjet[],
  activites: ActiviteProjet[]
): Map<string, number> {
  const codesInProject = new Set(activites.map((a) => a.code_activite_projet))
  const codeByActiviteId = new Map(
    activites.map((a) => [a.id_activite_projet, a.code_activite_projet])
  )

  const counts = new Map<string, number>()

  for (const indicateur of indicateurs) {
    const activiteRef = indicateur.activite_projet
    let code: string | null = null

    if (typeof activiteRef === 'string') {
      code = activiteRef
    } else if (activiteRef && typeof activiteRef === 'object') {
      code =
        (typeof activiteRef.code_activite_projet === 'string'
          ? activiteRef.code_activite_projet
          : null) ??
        codeByActiviteId.get(Number(activiteRef.id_activite_projet)) ??
        null
    }

    if (!code || !codesInProject.has(code)) continue

    counts.set(code, (counts.get(code) ?? 0) + 1)
  }

  return counts
}
