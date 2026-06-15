import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { titrePersonnelService } from '@/simadou/allSercices/titrePersonnelService'
import type { TitrePersonnel } from '@/simadou/allTypes'
import type { TitrePersonnelFormData } from '@/simadou/schemas/titrePersonnelSchema'

export const titrePersonnelQueryKeys = {
  all: ['titres-personnel'] as const,
} as const

export function useGetTitresPersonnel() {
  return useQuery({
    queryKey: titrePersonnelQueryKeys.all,
    queryFn: () => titrePersonnelService.getAll(),
  })
}

export function useCreateTitrePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TitrePersonnelFormData) => titrePersonnelService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: titrePersonnelQueryKeys.all })
    },
  })
}

export function useUpdateTitrePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: TitrePersonnelFormData
    }) => titrePersonnelService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: titrePersonnelQueryKeys.all })
    },
  })
}

export function useDeleteTitrePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => titrePersonnelService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: titrePersonnelQueryKeys.all })
    },
  })
}

export type { TitrePersonnel }
