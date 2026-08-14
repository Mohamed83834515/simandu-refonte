import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { suiviIndicateurContratService } from '@/simadou/allSercices/suiviIndicateurContratService'
import type { SuiviIndicateurContratPayload } from '@/simadou/allTypes/suiviIndicateurContrat'

export const suiviIndicateurContratQueryKeys = {
  byIndicateur: (idIndicateur: number) =>
    ['suivis-contrats', idIndicateur] as const,
}

export function useGetSuivisIndicateurContrat(
  idIndicateur: number,
  enabled = true
) {
  return useQuery({
    queryKey: suiviIndicateurContratQueryKeys.byIndicateur(idIndicateur),
    queryFn: () =>
      suiviIndicateurContratService.getByIndicateur(idIndicateur),
    enabled: enabled && Number.isFinite(idIndicateur) && idIndicateur > 0,
  })
}

export function useCreateSuiviIndicateurContrat(idIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviIndicateurContratPayload) =>
      suiviIndicateurContratService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        suiviIndicateurContratQueryKeys.byIndicateur(idIndicateur)
      )
    },
  })
}

export function useUpdateSuiviIndicateurContrat(idIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviIndicateurContratPayload
    }) => suiviIndicateurContratService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        suiviIndicateurContratQueryKeys.byIndicateur(idIndicateur)
      )
    },
  })
}

export function useDeleteSuiviIndicateurContrat(idIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviIndicateurContratService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        suiviIndicateurContratQueryKeys.byIndicateur(idIndicateur)
      )
    },
  })
}
