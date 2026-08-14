import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { ConventionApiPayload } from '@/simadou/allTypes/convention'
import { conventionService } from '@/simadou/allSercices/conventionService'

export const conventionQueryKeys = {
  all: ['conventions'] as const,
  byProjet: (idProjet: number) =>
    [...conventionQueryKeys.all, 'projet', idProjet] as const,
}

export const useGetConventionsByProjet = (idProjet?: number) =>
  useQuery({
    queryKey: conventionQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => conventionService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useCreateConventionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConventionApiPayload) => conventionService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conventionQueryKeys.byProjet(idProjet),
      })
      toast.success('Convention créée avec succès')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la création de la convention')
      )
    },
  })
}

export const useUpdateConventionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConventionApiPayload }) =>
      conventionService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conventionQueryKeys.byProjet(idProjet),
      })
      toast.success('Convention modifiée avec succès')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification de la convention')
      )
    },
  })
}

export const useDeleteConventionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => conventionService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conventionQueryKeys.byProjet(idProjet),
      })
      toast.success('Convention supprimée avec succès')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression de la convention')
      )
    },
  })
}
