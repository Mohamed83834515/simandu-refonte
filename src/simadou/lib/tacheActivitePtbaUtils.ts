import type { TacheActivitePtba } from '@/simadou/allTypes/tacheActivitePtba'
import { resolveIdActivite } from '@/simadou/allTypes/tacheActivitePtba'
import type { TacheActivitePtbaFormData } from '@/simadou/schemas/tacheActivitePtbaSchemas'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export type TacheActivitePtbaApiPayload = {
  intutile_tache_gt: string
  proportion_gt: string
  code_tache_gt: string
  date_debut_gt: string
  date_fin_gt: string
  n_lot_gt: number
  observation_gt?: string
  id_personnel_gt?: number
  responsable_gt?: number
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

export function buildTacheActivitePtbaPayload(
  data: TacheActivitePtbaFormData,
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
  if (data.responsable_gt != null && data.responsable_gt > 0) {
    payload.responsable_gt = data.responsable_gt
  }

  return payload
}
