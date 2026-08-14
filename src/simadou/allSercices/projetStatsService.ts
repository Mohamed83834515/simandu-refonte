import { apiClient } from '@/axios/api'
import type {
  ProjetAvancementAnnuelPoint,
  TauxGlobalPrevuAn,
  ViewRealiseAnActivite,
  ViewTauxAnActivite,
} from '@/simadou/allTypes/projetStats'

function filterByProjet<T extends { projet: number }>(
  items: T[],
  projetId: number | string
): T[] {
  return items.filter((item) => String(item.projet) === String(projetId))
}

export function normalizeTauxPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  const percent = Math.abs(value) <= 1 ? value * 100 : value
  return Math.round(percent * 10) / 10
}

function averageTauxByYear(
  items: Pick<ViewRealiseAnActivite, 'annee' | 'taux_an_activite'>[]
): Map<number, number> {
  const grouped = new Map<number, { sum: number; count: number }>()

  for (const item of items) {
    const current = grouped.get(item.annee) ?? { sum: 0, count: 0 }
    current.sum += Number(item.taux_an_activite) || 0
    current.count += 1
    grouped.set(item.annee, current)
  }

  const result = new Map<number, number>()
  for (const [year, { sum, count }] of grouped) {
    result.set(year, count > 0 ? sum / count : 0)
  }
  return result
}

export function buildAvancementAnnuelPoints(
  cibles: TauxGlobalPrevuAn[],
  realises: ViewRealiseAnActivite[],
  projectYears: number[]
): ProjetAvancementAnnuelPoint[] {
  const cibleByYear = new Map(
    cibles.map((item) => [item.annee, normalizeTauxPercent(item.taux_an)])
  )
  const realiseByYear = averageTauxByYear(realises)

  const years = new Set<number>(projectYears)
  cibles.forEach((item) => years.add(item.annee))
  realises.forEach((item) => years.add(item.annee))

  return Array.from(years)
    .sort((a, b) => a - b)
    .map((annee) => ({
      annee,
      cible: cibleByYear.get(annee) ?? 0,
      realise: normalizeTauxPercent(realiseByYear.get(annee) ?? 0),
    }))
}

export const projetStatsService = {
  async getTauxGlobalPrevuAn(
    projetId: number | string
  ): Promise<TauxGlobalPrevuAn[]> {
    const data = await apiClient.request<TauxGlobalPrevuAn[]>(
      '/stats/taux-global-prevu-an/'
    )
    return Array.isArray(data) ? filterByProjet(data, projetId) : []
  },

  async getViewRealiseAnAct(
    projetId: number | string
  ): Promise<ViewRealiseAnActivite[]> {
    const data = await apiClient.request<ViewRealiseAnActivite[]>(
      '/stats/view-realise-an-act/'
    )
    return Array.isArray(data) ? filterByProjet(data, projetId) : []
  },

  async getTauxGlobalAct(
    projetId: number | string
  ): Promise<ViewTauxAnActivite[]> {
    const data = await apiClient.request<ViewTauxAnActivite[]>(
      '/stats/view-taux-an-activite/'
    )
    return Array.isArray(data) ? filterByProjet(data, projetId) : []
  },
  async getAvancementAnnuel(
    projetId: number | string,
    projectYears: number[]
  ): Promise<ProjetAvancementAnnuelPoint[]> {
    const [cibles, realises] = await Promise.all([
      this.getTauxGlobalPrevuAn(projetId),
      this.getViewRealiseAnAct(projetId),
    ])

    return buildAvancementAnnuelPoints(cibles, realises, projectYears)
  },
}
