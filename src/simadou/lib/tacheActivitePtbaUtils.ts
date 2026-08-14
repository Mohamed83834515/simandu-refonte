import type { TacheActivitePtba } from '@/simadou/allTypes/tacheActivitePtba'
import { resolveIdActivite } from '@/simadou/allTypes/tacheActivitePtba'
import { parseProportionPercent } from '@/simadou/allTypes/suiviTacheActivite'
import type {
  TacheActivitePtbaFormData,
  TacheActivitePtbaProjetFormData,
} from '@/simadou/schemas/tacheActivitePtbaSchemas'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export const TACHE_PROPORTION_TOTAL_MAX = 100

/** Parse `proportion_gt` (number or `"25"` / `"25%"`) to a finite number. */
export function parseTacheProportion(
  value: string | number | null | undefined
): number {
  return parseProportionPercent(value)
}

/** Sum of proportions for an activité's tasks (optionally excluding one task). */
export function sumTacheProportions(
  taches: Pick<TacheActivitePtba, 'proportion_gt' | 'id_groupe_tache'>[],
  excludeId?: number | null
): number {
  return taches.reduce((total, tache) => {
    if (
      excludeId != null &&
      Number(tache.id_groupe_tache) === Number(excludeId)
    ) {
      return total
    }
    return total + parseTacheProportion(tache.proportion_gt)
  }, 0)
}

/**
 * Max proportion allowed for a create/edit:
 * - create: 100 − sum(others)
 * - edit: 100 − sum(others excluding current) (= current + leftover)
 */
export function getMaxAssignableProportion(
  taches: Pick<TacheActivitePtba, 'proportion_gt' | 'id_groupe_tache'>[],
  editingId?: number | null
): number {
  const usedByOthers = sumTacheProportions(taches, editingId)
  return Math.max(0, TACHE_PROPORTION_TOTAL_MAX - usedByOthers)
}

export function canAddTacheWithProportions(
  taches: Pick<TacheActivitePtba, 'proportion_gt' | 'id_groupe_tache'>[]
): boolean {
  return getMaxAssignableProportion(taches) > 0
}

export type TacheActivitePtbaApiPayload = {
  intutile_tache_gt: string
  proportion_gt: string
  code_tache_gt: string
  date_debut_gt: string
  date_fin_gt: string
  n_lot_gt: number
  observation_gt?: string
  id_personnel_gt?: number
  responsable_gt?: number | string
  id_activite: number
}

export function normalizeTacheActivitePtba(
  raw: TacheActivitePtba
): TacheActivitePtba {
  const idActivite = resolveIdActivite(raw) ?? 0

  return {
    ...raw,
    id_groupe_tache: Number(raw.id_groupe_tache),
    intutile_tache_gt: raw.intutile_tache_gt ?? '',
    proportion_gt: raw.proportion_gt != null ? String(raw.proportion_gt) : '',
    code_tache_gt: raw.code_tache_gt ?? '',
    date_debut_gt: raw.date_debut_gt ?? '',
    date_fin_gt: raw.date_fin_gt ?? '',
    n_lot_gt: Number(raw.n_lot_gt) || 1,
    observation_gt: raw.observation_gt ?? '',
    id_activite: idActivite,
    responsable_gt:
      typeof raw.responsable_gt === 'string' ||
      typeof raw.responsable_gt === 'number' ||
      (typeof raw.responsable_gt === 'object' && raw.responsable_gt !== null)
        ? raw.responsable_gt
        : undefined,
  }
}

export function filterTachesByActivite(
  items: TacheActivitePtba[],
  idActivite: number
): TacheActivitePtba[] {
  return items
    .map(normalizeTacheActivitePtba)
    .filter((item) => item.id_activite === idActivite)
}

export function resolvePersonnelFormValue(
  value: unknown
): number | undefined {
  const id = resolveRelationId(value, 'n_personnel')
  return id != null && id > 0 ? id : undefined
}

export function resolveResponsableTextFormValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const personnel = value as { prenom_perso?: string; nom_perso?: string }
    return `${personnel.prenom_perso ?? ''} ${personnel.nom_perso ?? ''}`.trim()
  }
  return ''
}

export function buildTacheActivitePtbaPayload(
  data: TacheActivitePtbaFormData | TacheActivitePtbaProjetFormData,
  idActivite: number
): TacheActivitePtbaApiPayload {
  const payload: TacheActivitePtbaApiPayload = {
    intutile_tache_gt: data.intutile_tache_gt.trim(),
    proportion_gt: String(data.proportion_gt),
    code_tache_gt: data.code_tache_gt.trim(),
    date_debut_gt: data.date_debut_gt,
    date_fin_gt: data.date_fin_gt,
    n_lot_gt: data.n_lot_gt,
    id_activite: idActivite,
  }

  if (data.observation_gt?.trim()) {
    payload.observation_gt = data.observation_gt.trim()
  }
  if (data.id_personnel_gt != null && data.id_personnel_gt > 0) {
    payload.id_personnel_gt = data.id_personnel_gt
  }
  const responsable = data.responsable_gt
  if (typeof responsable === 'string' && responsable.trim()) {
    payload.responsable_gt = responsable.trim()
  } else if (typeof responsable === 'number' && responsable > 0) {
    payload.responsable_gt = responsable
  }

  return payload
}

export function buildTacheActivitePtbaProjetPayload(
  data: TacheActivitePtbaProjetFormData,
  idActivite: number
): TacheActivitePtbaApiPayload {
  const payload = buildTacheActivitePtbaPayload(data, idActivite)
  const responsable = data.responsable_gt?.trim()
  if (responsable) {
    payload.responsable_gt = responsable
  } else {
    delete payload.responsable_gt
  }
  return payload
}

function upsertTacheActiviteInList(
  current: TacheActivitePtba[] = [],
  tache: TacheActivitePtba,
  idActivite: number
): TacheActivitePtba[] {
  const normalized = normalizeTacheActivitePtba(tache)
  if (normalized.id_activite !== idActivite) return current

  const index = current.findIndex(
    (item) => item.id_groupe_tache === normalized.id_groupe_tache
  )

  if (index >= 0) {
    const next = [...current]
    next[index] = { ...current[index], ...normalized }
    return next
  }

  return [...current, normalized]
}

export function mergeTacheActivitePtbaInCache(
  current: TacheActivitePtba[] | undefined,
  tache: TacheActivitePtba,
  idActivite: number,
  fallback?: Partial<TacheActivitePtbaApiPayload>
): TacheActivitePtba[] {
  const existing = current?.find(
    (item) => item.id_groupe_tache === tache.id_groupe_tache
  )
  const merged: TacheActivitePtba = {
    ...(existing ?? tache),
    ...tache,
    ...(fallback?.responsable_gt != null && fallback.responsable_gt !== ''
      ? { responsable_gt: fallback.responsable_gt }
      : {}),
  }

  return upsertTacheActiviteInList(current, merged, idActivite)
}
