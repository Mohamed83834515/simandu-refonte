import type { SuiviAvancementContrat } from '@/simadou/allTypes'
import type { SuiviTacheActivite } from '@/simadou/allTypes/suiviTacheActivite'

export type RetardAccuseInfo =
  | { kind: 'none' }
  | { kind: 'today' }
  | { kind: 'until'; days: number }
  | { kind: 'passed'; days: number }

export function getLatestObservation(
  observations: SuiviAvancementContrat[]
): SuiviAvancementContrat | undefined {
  if (observations.length === 0) return undefined
  return [...observations].sort(
    (a, b) =>
      new Date(b.date_suivi).getTime() - new Date(a.date_suivi).getTime()
  )[0]
}

export function getMostRecentDateRealisation(
  suivis: SuiviTacheActivite[]
): string | undefined {
  let latest: Date | null = null
  let latestRaw: string | undefined

  for (const suivi of suivis) {
    const raw = suivi.date_reele?.trim()
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    if (!latest || date.getTime() > latest.getTime()) {
      latest = date
      latestRaw = raw
    }
  }

  return latestRaw
}

function startOfDay(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export function computeRetardAccuse(
  dateRealisation: string | undefined,
  options?: { hasTaches?: boolean; percent?: number }
): RetardAccuseInfo {
  if (options?.hasTaches && (options.percent ?? 0) >= 100) {
    return { kind: 'none' }
  }

  if (!dateRealisation?.trim()) return { kind: 'none' }

  const delai = startOfDay(new Date(dateRealisation))
  if (Number.isNaN(delai.getTime())) return { kind: 'none' }

  const today = startOfDay(new Date())
  const diffDays = Math.round(
    (delai.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return { kind: 'today' }
  if (diffDays > 0) return { kind: 'until', days: diffDays }
  return { kind: 'passed', days: Math.abs(diffDays) }
}

export function formatRetardAccuseLabel(info: RetardAccuseInfo): string {
  if (info.kind === 'none') return '—'
  if (info.kind === 'today') return "Aujourd'hui"
  if (info.kind === 'until') {
    return `${info.days} j restant${info.days > 1 ? 's' : ''}`
  }
  return `${info.days} j de retard`
}
