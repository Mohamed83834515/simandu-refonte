import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import contratPerformanceService from '@/simadou/allSercices/contratPerformanceService'
import type { ContratPerformancePayload } from '@/simadou/allTypes/contratPerformance'

export const contratPerformanceQueryKeys = {
  all: (programmeId?: number) => ['contrats-performance', programmeId ?? 'all'] as const,
  detail: (id: number) => ['contrats-performance', 'detail', id] as const,
}

export const useGetContratsPerformance = (programmeId?: number) => {
  return useQuery({
    queryKey: contratPerformanceQueryKeys.all(programmeId),
    queryFn: () => contratPerformanceService.getAll(programmeId),
    enabled: programmeId != null && programmeId > 0,
  })
}

export const useGetContratPerformance = (id: number | string | undefined) => {
  return useQuery({
    queryKey: contratPerformanceQueryKeys.detail(Number(id)),
    queryFn: () => contratPerformanceService.getById(Number(id)),
    enabled: id != null && id !== '' && Number(id) > 0,
  })
}

export const useCreateContratPerformance = (programmeId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ContratPerformancePayload) => contratPerformanceService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contratPerformanceQueryKeys.all(programmeId ?? 0),
      })
      toast.success('Contrat de performance créé avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement du contrat de performance"))
    },
  })
}

export const useUpdateContratPerformance = (id: number, programmeId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContratPerformancePayload }) =>
      contratPerformanceService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contratPerformanceQueryKeys.all(programmeId),
      })
      await queryClient.invalidateQueries({
        queryKey: contratPerformanceQueryKeys.detail(id),
      })
      toast.success('Contrat de performance modifié avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la modification du contrat de performance'))
    },
  })
}

export const useDeleteContratPerformance = (programmeId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => contratPerformanceService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contratPerformanceQueryKeys.all(programmeId),
      })
      toast.success('Contrat de performance supprimé avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression du contrat de performance'))
    },
  })
}
