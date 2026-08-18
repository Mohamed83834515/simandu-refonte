import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acteurService } from '@/simadou/allSercices/acteurService';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error-message'
import { ActeurFormData } from '@/simadou/allTypes';


export const acteurQueryKeys = {
  all: ['acteurs'] as const,
  list: () => [...acteurQueryKeys.all, 'list'] as const,
}

export const useGetActeurs = () => {
  return useQuery({
    queryKey: acteurQueryKeys.list(),
    queryFn: () => acteurService.getAll(),
  })
}

export const useSaveActeur = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ActeurFormData) =>
      isEdit && currentRow?.id_acteur
        ? acteurService.update(currentRow.id_acteur, data)
        : acteurService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: acteurQueryKeys.list(),
      })
      toast.success(isEdit ? 'Acteur modifié avec succès' : 'Acteur créé avec succès')
      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteActeur = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => acteurService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: acteurQueryKeys.list(),
      })
      toast.success('Acteur supprimé avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getActeurs = async () => {
  const response = await acteurService.getAll();
  return response;
};