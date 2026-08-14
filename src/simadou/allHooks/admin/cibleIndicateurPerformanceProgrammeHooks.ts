import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import cibleIndicateurPerformanceProgrammeService from '@/simadou/allSercices/cibleIndicateurPerformanceProgrammeService'
import type { CibleIndicateurPerformanceProgrammePayload } from '@/simadou/allTypes/cibleIndicateurPerformanceProgramme'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const cibleIndicateurPerformanceProgrammeQueryKeys = {
  all: ['cibles-indicateurs-performances-programmes'] as const,
  byProgramme: (programmeId: number) =>
    [
      ...cibleIndicateurPerformanceProgrammeQueryKeys.all,
      'programme',
      programmeId,
    ] as const,
}

export const useGetCiblesIndicateurPerformanceProgramme = (
  programmeId?: number
) =>
  useQuery({
    queryKey: cibleIndicateurPerformanceProgrammeQueryKeys.byProgramme(
      programmeId ?? 0
    ),
    queryFn: () =>
      cibleIndicateurPerformanceProgrammeService.getByProgramme(programmeId!),
    enabled: programmeId != null && programmeId > 0,
  })

export const useCreateCibleIndicateurPerformanceProgramme = (
  programmeId: number
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CibleIndicateurPerformanceProgrammePayload) =>
      cibleIndicateurPerformanceProgrammeService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cibleIndicateurPerformanceProgrammeQueryKeys.byProgramme(programmeId)
      )
    },
  })
}

export const useUpdateCibleIndicateurPerformanceProgramme = (
  programmeId: number
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<CibleIndicateurPerformanceProgrammePayload>
    }) => cibleIndicateurPerformanceProgrammeService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cibleIndicateurPerformanceProgrammeQueryKeys.byProgramme(programmeId)
      )
    },
  })
}

export const useDeleteCibleIndicateurPerformanceProgramme = (
  programmeId: number
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      cibleIndicateurPerformanceProgrammeService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cibleIndicateurPerformanceProgrammeQueryKeys.byProgramme(programmeId)
      )
    },
  })
}
