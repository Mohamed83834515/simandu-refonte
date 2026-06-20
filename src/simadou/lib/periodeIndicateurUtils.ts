import type { PeriodeIndicateur } from '@/simadou/allTypes/periodeIndicateur'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

export function resolvePeriodeIndicateurRefIndicateur(
  periode: PeriodeIndicateur
): number | null {
  return resolveRelationId(periode.ref_indicateur, 'id_ref_ind_cmr')
}

export function filterPeriodesByIndicateur(
  periodes: PeriodeIndicateur[],
  refIndicateur: number,
  options?: { trustQueryFilter?: boolean }
): PeriodeIndicateur[] {
  const filtered = periodes.filter((periode) => {
    const periodeRef = resolvePeriodeIndicateurRefIndicateur(periode)
    return periodeRef === refIndicateur
  })

  if (filtered.length > 0) return filtered

  if (options?.trustQueryFilter && periodes.length > 0) {
    const allMissingRef = periodes.every(
      (periode) => resolvePeriodeIndicateurRefIndicateur(periode) == null
    )
    if (allMissingRef) return periodes
  }

  return filtered
}
