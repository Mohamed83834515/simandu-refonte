import type { Convention } from '@/simadou/allTypes/convention'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function resolveConventionProjetId(
  value: Convention['projet']
): number | undefined {
  const id =
    resolveRelationId(value, 'id_projet') ?? resolveRelationId(value, 'id')
  return id ?? undefined
}

export function filterConventionsByProjet(
  items: Convention[],
  idProjet: number
): Convention[] {
  return items.filter(
    (item) => resolveConventionProjetId(item.projet) === idProjet
  )
}

export function resolvePartenaireConventionId(
  value: Convention['partenaire_conv']
): number | null {
  return resolveRelationId(value, 'id_acteur')
}
