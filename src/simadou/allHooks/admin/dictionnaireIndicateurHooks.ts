import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { handleServerError } from '@/lib/handle-server-error'
import { dictionnaireIndicateurService } from '@/simadou/allSercices/dictionnaireIndicateurService'
import type { DictionnaireIndicateur } from '@/simadou/allTypes'
import type { DictionnaireIndicateurWriteData } from '@/simadou/schemas/dictionnaireIndicateurSchemas'

export const dictionnaireIndicateurQueryKeys = {
  all: ['dictionnaire-indicateur'] as const,
  byId: (id: number) => ['dictionnaire-indicateur', id] as const,
} as const

export function useGetDictionnaireIndicateurs(enabled = true) {
  return useQuery({
    queryKey: dictionnaireIndicateurQueryKeys.all,
    queryFn: () => dictionnaireIndicateurService.getAll(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGetDictionnaireIndicateur(id: number | null | undefined) {
  return useQuery({
    queryKey: dictionnaireIndicateurQueryKeys.byId(id ?? 0),
    queryFn: () => dictionnaireIndicateurService.getById(id!),
    enabled: id != null,
  })
}

export function useCreateDictionnaireIndicateur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DictionnaireIndicateurWriteData) =>
      dictionnaireIndicateurService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onError: (error) => handleServerError(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionnaireIndicateurQueryKeys.all })
    },
  })
}

export function useUpdateDictionnaireIndicateur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<DictionnaireIndicateurWriteData>
    }) => dictionnaireIndicateurService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onError: (error) => handleServerError(error),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: dictionnaireIndicateurQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: dictionnaireIndicateurQueryKeys.byId(vars.id) })
    },
  })
}

export function useDeleteDictionnaireIndicateur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => dictionnaireIndicateurService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onError: (error) => handleServerError(error),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionnaireIndicateurQueryKeys.all })
    },
  })
}

export type { DictionnaireIndicateur }

