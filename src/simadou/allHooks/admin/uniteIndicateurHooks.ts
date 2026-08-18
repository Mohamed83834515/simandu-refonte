// simadou/allHooks/admin/uniteIndicateurHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uniteIndicateurService } from '@/simadou/allSercices/uniteIndicateurService'
import { UniteIndicateurFormData } from '@/simadou/schemas/uniteIndicateurSchema'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'

export const uniteIndicateurQueryKeys = {
  all: ['unites-indicateur'] as const,
  list: () => [...uniteIndicateurQueryKeys.all, 'list'] as const,
}

export const useGetUnitesIndicateur = () => {
  return useQuery({
    queryKey: uniteIndicateurQueryKeys.list(),
    queryFn: () => uniteIndicateurService.getAll(),
  })
}

export const getUniteIndicateurs = async () => uniteIndicateurService.getAll()

export const useSaveUniteIndicateur = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UniteIndicateurFormData) =>
      isEdit && currentRow?.id_unite
        ? uniteIndicateurService.update(currentRow.id_unite, data)
        : uniteIndicateurService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: uniteIndicateurQueryKeys.list(),
      })
      toast.success(isEdit ? 'Unité modifiée avec succès' : 'Unité créée avec succès')
      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteUniteIndicateur = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => uniteIndicateurService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: uniteIndicateurQueryKeys.list(),
      })
      toast.success('Unité supprimée avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}