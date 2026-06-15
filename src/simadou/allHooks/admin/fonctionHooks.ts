// simadou/allHooks/admin/fonctionHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fonctionService } from '@/simadou/allSercices/fonctionService'
import { FonctionFormData } from '@/simadou/schemas/fonctionSchema'
import { toast } from 'sonner'

export const fonctionQueryKeys = {
  all: ['fonctions'] as const,
  list: () => [...fonctionQueryKeys.all, 'list'] as const,
}

export const useGetFonctions = () => {
  return useQuery({
    queryKey: fonctionQueryKeys.list(),
    queryFn: () => fonctionService.getAll(),
  })
}

export const useSaveFonction = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FonctionFormData) =>
      isEdit && currentRow?.id_fonction
        ? fonctionService.update(currentRow.id_fonction, data)
        : fonctionService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: fonctionQueryKeys.list(),
      })
      toast.success(isEdit ? 'Fonction modifiée avec succès' : 'Fonction créée avec succès')
      onSuccess?.()
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Une erreur est survenue')
    },
  })
}

export const useDeleteFonction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => fonctionService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: fonctionQueryKeys.list(),
      })
      toast.success('Fonction supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}