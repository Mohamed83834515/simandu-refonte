import type { CoutUnitairePtba } from '@/simadou/allTypes/coutUnitairePtba'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export type CoutUnitairePtbaApiPayload = {
  prix_unitaire: number
  quantite_cu: number
  unite_cu: string
  intitule_tache: string
  ordre: number
  id_personnel: number
  modifier_le: string
  modifier_par: number
  ptba_activite: number
}

export function resolvePtbaActiviteId(value: unknown): number | undefined {
  const id =
    resolveRelationId(value, 'id_ptba') ?? resolveRelationId(value, 'id')
  return id ?? undefined
}

export function filterCoutsUnitairesByActivite(
  items: CoutUnitairePtba[],
  idActivite: number
): CoutUnitairePtba[] {
  return items.filter(
    (item) => resolvePtbaActiviteId(item.ptba_activite) === idActivite
  )
}

export function buildCoutUnitairePtbaPayload(
  data: {
    prix_unitaire: number
    quantite_cu: number
    unite_cu: string
    intitule_tache: string
    ordre: number
    id_personnel: number
  },
  idActivite: number,
  modifierPar: number
): CoutUnitairePtbaApiPayload {
  return {
    ...data,
    modifier_le: new Date().toISOString(),
    modifier_par: modifierPar,
    ptba_activite: idActivite,
  }
}
