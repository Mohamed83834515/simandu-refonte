import { type Personnel } from './personnel'
import type { Ptba } from './ptba'

export interface TacheActivitePtba extends Record<string, unknown> {
  id_groupe_tache: number
  intutile_tache_gt: string // max 200 chars
  proportion_gt: string // max 10 chars
  code_tache_gt: string // max 200 chars
  date_debut_gt: string // date
  date_fin_gt: string // date
  date_reelle_gt: string // date
  n_lot_gt: number
  valide: boolean
  observation_gt?: string // max 200 chars
  livrable_gt: string // max 100 chars
  id_personnel_gt: number | Personnel
  responsable_gt?: number | Personnel | string // max 100 chars
  id_activite: number | Ptba // relation vers Ptba
  created_at?: string
  updated_at?: string
}

export function resolveIdActivite(
  tache: Pick<TacheActivitePtba, 'id_activite'>
): number | undefined {
  const raw = tache.id_activite
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  if (typeof raw === 'object' && raw !== null && 'id_ptba' in raw) {
    const n = Number((raw as Ptba).id_ptba)
    return Number.isFinite(n) ? n : undefined
  }
  if (typeof raw === 'string') {
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

export function tacheBelongsToActivite(
  tache: TacheActivitePtba,
  activite: Pick<Ptba, 'id_ptba'>
): boolean {
  const tacheActiviteId = resolveIdActivite(tache)
  const activiteId =
    typeof activite.id_ptba === 'number'
      ? activite.id_ptba
      : Number(activite.id_ptba)
  return (
    tacheActiviteId != null &&
    Number.isFinite(activiteId) &&
    tacheActiviteId === activiteId
  )
}
