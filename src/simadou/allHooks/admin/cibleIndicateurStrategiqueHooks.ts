import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cibleIndicateurStrategiqueService } from '@/simadou/allSercices/cibleIndicateurStrategiqueService'
import type { CibleIndicateurStrategique } from '@/simadou/allTypes/cibleIndicateurStrategique'
import type { CibleIndicateurStrategiquePayload } from '@/simadou/schemas/indicateurStrategiqueSchemas'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const cibleIndicateurStrategiqueQueryKeys = {
  all: ['cibles-indicateur-strategique'] as const,
} as const

export function useGetCiblesIndicateurStrategique() {
  return useQuery({
    queryKey: cibleIndicateurStrategiqueQueryKeys.all,
    queryFn: () => cibleIndicateurStrategiqueService.getAll(),
  })
}

export function useCreateCibleIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CibleIndicateurStrategiquePayload) =>
      cibleIndicateurStrategiqueService.create(
        data as CibleIndicateurStrategique
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cibleIndicateurStrategiqueQueryKeys.all)
    },
  })
}

export function useUpdateCibleIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CibleIndicateurStrategiquePayload
    }) =>
      cibleIndicateurStrategiqueService.update(
        id,
        data as CibleIndicateurStrategique
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cibleIndicateurStrategiqueQueryKeys.all)
    },
  })
}

export function useDeleteCibleIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cibleIndicateurStrategiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cibleIndicateurStrategiqueQueryKeys.all)
    },
  })
}
