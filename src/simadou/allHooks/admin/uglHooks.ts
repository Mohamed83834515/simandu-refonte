import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { uglService } from '@/simadou/allSercices/uglService';
import { UGLFormData } from '@/simadou/allTypes/entities';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error-message'

export const uglQueryKeys = {
  all: ['ugls'] as const,
  lists: () => [...uglQueryKeys.all, 'list'] as const,
  list: () => [...uglQueryKeys.lists()] as const,
  details: () => [...uglQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...uglQueryKeys.details(), id] as const,
  localites: ['localites'] as const,
}

export const useGetUgls = () => {
  return useQuery({
    queryKey: uglQueryKeys.list(),
    queryFn: () => uglService.getAll(),
  })
}

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getUgls = async () => {
  const response = await uglService.getAll();
  return response;
};

export const useSaveUgl = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UGLFormData) =>
      isEdit && currentRow?.id_ugl
        ? uglService.update(currentRow.id_ugl, data)
        : uglService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: uglQueryKeys.list(),
      })
      toast.success(isEdit ? 'UGL modifiée avec succès' : 'UGL créée avec succès')

      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteUgl = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => uglService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: uglQueryKeys.list(),
      })
      toast.success('UGL supprimée avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}
