// simadou/allHooks/admin/categorieActeurHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categorieActeurService } from '@/simadou/allSercices/categorieActeurService'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { CategorieActeur } from '@/simadou/allTypes'

export const categorieActeurQueryKeys = {
  all: ['categories-acteurs'] as const,
  list: () => [...categorieActeurQueryKeys.all, 'list'] as const,
}

export const useGetCategoriesActeur = () => {
  return useQuery({
    queryKey: categorieActeurQueryKeys.list(),
    queryFn: () => categorieActeurService.getAll(),
  })
}

export const useSaveCategorieActeur = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategorieActeur) =>
      isEdit && currentRow?.id_categorie
        ? categorieActeurService.update(data, currentRow?.id_categorie)
        : categorieActeurService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categorieActeurQueryKeys.list(),
      })
      toast.success(isEdit ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès')
      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteCategorieActeur = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categorieActeurService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: categorieActeurQueryKeys.list(),
      })
      toast.success('Catégorie supprimée avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}