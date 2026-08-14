import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { SuiviAvancementContrat } from '@/simadou/allTypes'
import suiviAvancementContratService from '@/simadou/allSercices/suiviAvancementContratService'
import { suiviPtbaQueryKeys } from './suiviPtbaHooks'

export function useObservationsByActiviteIds(activiteIds: number[]) {
  const activiteIdsKey = activiteIds.join(',')

  const queries = useQueries({
    queries: activiteIds.map((id) => ({
      queryKey: suiviPtbaQueryKeys.suiviAvancement(id),
      queryFn: () => suiviAvancementContratService.getByActivite(id),
      enabled: Number.isFinite(id),
    })),
  })

  const queryDataKey = queries
    .map(
      (query, index) =>
        `${activiteIds[index]}:${query.dataUpdatedAt}:${query.isLoading}:${(query.data ?? []).length}`
    )
    .join('|')

  const observationsByActivite = useMemo(() => {
    const map = new Map<number, SuiviAvancementContrat[]>()
    activiteIds.forEach((id, index) => {
      map.set(id, queries[index]?.data ?? [])
    })
    return map
  }, [activiteIdsKey, queryDataKey, activiteIds, queries])

  return {
    observationsByActivite,
    isLoading:
      activiteIds.length > 0 && queries.some((query) => query.isLoading),
  }
}
