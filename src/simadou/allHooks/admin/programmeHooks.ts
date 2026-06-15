import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { programmeService } from '@/simadou/allSercices/programmeService'
import type { ProgrammeWriteData } from '@/simadou/schemas/programmeSchemas'

export const programmeQueryKeys = {
  all: ['programmes'] as const,
  byId: (id: number) => ['programmes', id] as const,
} as const

export function useGetProgrammes() {
  return useQuery({
    queryKey: programmeQueryKeys.all,
    queryFn: () => programmeService.getAll(),
  })
}

export function useCreateProgramme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProgrammeWriteData) => programmeService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programmeQueryKeys.all })
    },
  })
}

export function useUpdateProgramme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<ProgrammeWriteData>
    }) => programmeService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programmeQueryKeys.all })
    },
  })
}

export function useDeleteProgramme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => programmeService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programmeQueryKeys.all })
    },
  })
}
