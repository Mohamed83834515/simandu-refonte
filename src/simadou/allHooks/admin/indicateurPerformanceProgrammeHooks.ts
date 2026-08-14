import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import indicateurPerformanceProgrammeService, {
  type IndicateurPerformanceProgrammePayload,
} from '@/simadou/allSercices/indicateurPerformanceProgrammeService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import {
  attachCiblesToIndicateursProgramme,
  filterIndicateursByCadreAnalytique,
} from '@/simadou/lib/indicateurPerformanceProgrammeUtils'
import type { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import { useGetCiblesIndicateurPerformanceProgramme } from './cibleIndicateurPerformanceProgrammeHooks'

export const indicateurPerformanceProgrammeQueryKeys = {
  all: ['indicateurs-performances-programmes'] as const,
  byCadre: (cadreAnalytiqueId: number) =>
    [
      ...indicateurPerformanceProgrammeQueryKeys.all,
      'cadre',
      cadreAnalytiqueId,
    ] as const,
}

export const useGetAllIndicateursPerformanceProgramme = (enabled = true) =>
  useQuery({
    queryKey: [...indicateurPerformanceProgrammeQueryKeys.all, 'unfiltered'] as const,
    queryFn: () => indicateurPerformanceProgrammeService.getAll(),
    enabled,
  })

export const useGetIndicateursPerformanceByCadreAnalytique = (
  cadre: CadreAnalytique | null | undefined,
  programmeId?: number
) => {
  const cadreId = cadre?.id_ca
  const { data: indicateurs = [], isLoading: isLoadingIndicateurs } = useQuery({
    queryKey: indicateurPerformanceProgrammeQueryKeys.byCadre(cadreId ?? 0),
    queryFn: () =>
      indicateurPerformanceProgrammeService.getByCadreAnalytique(cadreId!),
    enabled: cadreId != null && cadreId > 0,
  })

  const { data: cibles = [], isLoading: isLoadingCibles } =
    useGetCiblesIndicateurPerformanceProgramme(programmeId)

  const merged = useMemo(() => {
    const scoped = cadre
      ? filterIndicateursByCadreAnalytique(indicateurs, cadre)
      : []
    return attachCiblesToIndicateursProgramme(scoped, cibles)
  }, [indicateurs, cibles, cadre])

  return {
    data: merged,
    isLoading: isLoadingIndicateurs || isLoadingCibles,
  }
}

export const useCreateIndicateurPerformanceProgramme = (_programmeId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurPerformanceProgrammePayload) =>
      indicateurPerformanceProgrammeService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        indicateurPerformanceProgrammeQueryKeys.all
      )
    },
  })
}

export const useUpdateIndicateurPerformanceProgramme = (_programmeId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurPerformanceProgrammePayload>
    }) => indicateurPerformanceProgrammeService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        indicateurPerformanceProgrammeQueryKeys.all
      )
    },
  })
}

export const useDeleteIndicateurPerformanceProgramme = (_programmeId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurPerformanceProgrammeService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        indicateurPerformanceProgrammeQueryKeys.all
      )
    },
  })
}
