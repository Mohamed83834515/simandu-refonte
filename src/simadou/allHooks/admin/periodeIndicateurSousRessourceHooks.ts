import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  PeriodeSousRessourceType,
  PeriodeSousRessourceWritePayload,
} from '@/simadou/allTypes/periodeIndicateurSousRessource'
import { createPeriodeSousRessourceService } from '@/simadou/allSercices/periodeIndicateurSousRessourceService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const periodeSousRessourceQueryKeys = {
  all: ['periodes-indicateurs-sous-ressources'] as const,
  list: (periodeId: number | undefined, resource: PeriodeSousRessourceType) =>
    [...periodeSousRessourceQueryKeys.all, resource, periodeId] as const,
}

function getService(resource: PeriodeSousRessourceType) {
  return createPeriodeSousRessourceService(resource)
}

export function useGetPeriodeSousRessources(
  periodeId: number | null | undefined,
  resource: PeriodeSousRessourceType
) {
  return useQuery({
    queryKey: periodeSousRessourceQueryKeys.list(periodeId ?? undefined, resource),
    queryFn: () => getService(resource).getAll(periodeId!),
    enabled: periodeId != null && Number.isFinite(periodeId),
    meta: { suppressGlobalErrorToast: true },
  })
}

export function useCreatePeriodeSousRessource(
  periodeId: number,
  resource: PeriodeSousRessourceType
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PeriodeSousRessourceWritePayload) =>
      getService(resource).create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeSousRessourceQueryKeys.list(periodeId, resource)
      )
    },
  })
}

export function useUpdatePeriodeSousRessource(
  periodeId: number,
  resource: PeriodeSousRessourceType
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: number
      data: PeriodeSousRessourceWritePayload
    }) => getService(resource).update(itemId, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeSousRessourceQueryKeys.list(periodeId, resource)
      )
    },
  })
}

export function useDeletePeriodeSousRessource(
  periodeId: number,
  resource: PeriodeSousRessourceType
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: number) => getService(resource).delete(itemId),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeSousRessourceQueryKeys.list(periodeId, resource)
      )
    },
  })
}
