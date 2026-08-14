import type { TacheActivitePtba } from '@/simadou/allTypes'

export type GanttUnit = 'month' | 'quarter'

export type GanttBucket = {
  key: string
  label: string
  /** Début de la période (timestamp, inclus). */
  start: number
  /** Fin de la période (timestamp, inclus). */
  end: number
}

export type GanttTimeline = {
  buckets: GanttBucket[]
  unit: GanttUnit
}

/** Bascule mois → trimestre au-delà de ~18 mois d'étendue. */
const MAX_MONTHS_FOR_MONTHLY = 18

/**
 * Initiales des mois (janvier → décembre) : colonnes de Gantt étroites
 * dans les exports.
 */
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

function parseDate(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

/**
 * Étendue [début, fin] d'une tâche à partir de date_debut_gt / date_fin_gt.
 * Tolère une seule des deux dates (l'étendue se réduit à cette date).
 */
export function getTacheRange(
  tache: Pick<TacheActivitePtba, 'date_debut_gt' | 'date_fin_gt'>
): { start: number; end: number } | null {
  const debut = parseDate(tache.date_debut_gt)
  const fin = parseDate(tache.date_fin_gt)
  if (debut == null && fin == null) return null

  const start = debut ?? (fin as number)
  const end = fin ?? (debut as number)
  return { start: Math.min(start, end), end: Math.max(start, end) }
}

/**
 * Construit l'axe temporel couvrant toutes les tâches. Sans `forcedUnit`,
 * bascule automatiquement en trimestres au-delà de 18 mois d'étendue.
 */
export function buildGanttTimeline(
  taches: Pick<TacheActivitePtba, 'date_debut_gt' | 'date_fin_gt'>[],
  forcedUnit?: GanttUnit
): GanttTimeline {
  let min = Infinity
  let max = -Infinity

  for (const tache of taches) {
    const range = getTacheRange(tache)
    if (!range) continue
    if (range.start < min) min = range.start
    if (range.end > max) max = range.end
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { buckets: [], unit: 'month' }
  }

  const minDate = new Date(min)
  const maxDate = new Date(max)

  const monthsSpan =
    (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
    (maxDate.getMonth() - minDate.getMonth()) +
    1

  const unit: GanttUnit =
    forcedUnit ?? (monthsSpan <= MAX_MONTHS_FOR_MONTHLY ? 'month' : 'quarter')

  const buckets: GanttBucket[] = []

  if (unit === 'month') {
    let year = minDate.getFullYear()
    let month = minDate.getMonth()

    while (
      year < maxDate.getFullYear() ||
      (year === maxDate.getFullYear() && month <= maxDate.getMonth())
    ) {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999)

      buckets.push({
        key: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: MONTH_LETTERS[month],
        start: start.getTime(),
        end: end.getTime(),
      })

      month += 1
      if (month > 11) {
        month = 0
        year += 1
      }
    }
  } else {
    let year = minDate.getFullYear()
    let quarter = Math.floor(minDate.getMonth() / 3)
    const endYear = maxDate.getFullYear()
    const endQuarter = Math.floor(maxDate.getMonth() / 3)

    while (year < endYear || (year === endYear && quarter <= endQuarter)) {
      const startMonth = quarter * 3
      const start = new Date(year, startMonth, 1)
      const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999)

      buckets.push({
        key: `${year}-T${quarter + 1}`,
        label: `T${quarter + 1} ${String(year).slice(2)}`,
        start: start.getTime(),
        end: end.getTime(),
      })

      quarter += 1
      if (quarter > 3) {
        quarter = 0
        year += 1
      }
    }
  }

  return { buckets, unit }
}

/** Une tâche est active dans la période si les intervalles se chevauchent. */
export function tacheActiveInBucket(
  tache: Pick<TacheActivitePtba, 'date_debut_gt' | 'date_fin_gt'>,
  bucket: GanttBucket
): boolean {
  const range = getTacheRange(tache)
  if (!range) return false
  return range.start <= bucket.end && range.end >= bucket.start
}
