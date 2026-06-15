import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { indicateurStrategiqueService } from '@/simadou/allSercices/indicateurStrategiqueService'
import type { IndicateurStrategique } from '@/simadou/allTypes/indicateurStrategique'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const indicateurStrategiqueQueryKeys = {
  all: ['indicateurs-strategiques'] as const,
} as const

export function useGetIndicateursStrategique() {
  return useQuery({
    queryKey: indicateurStrategiqueQueryKeys.all,
    queryFn: () => indicateurStrategiqueService.getAll(),
  })
}

export function useCreateIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<IndicateurStrategique, 'id_indicateur_str'>) =>
      indicateurStrategiqueService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurStrategiqueQueryKeys.all)
    },
  })
}

export function useUpdateIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurStrategique>
    }) => indicateurStrategiqueService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurStrategiqueQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurStrategiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurStrategiqueQueryKeys.all)
    },
  })
}
