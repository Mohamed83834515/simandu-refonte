import type { DossierProjet } from '@/simadou/allTypes/dossierProjet'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function resolveDossierProjetId(
  value: DossierProjet['projet']
): number | undefined {
  const id =
    resolveRelationId(value, 'id_projet') ?? resolveRelationId(value, 'id')
  return id ?? undefined
}

export function filterDossiersByProjet(
  items: DossierProjet[],
  idProjet: number
): DossierProjet[] {
  return items.filter(
    (item) => resolveDossierProjetId(item.projet) === idProjet
  )
}
