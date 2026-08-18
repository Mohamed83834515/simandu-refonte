import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import typeActiviteService from '@/simadou/allSercices/typeActiviteService'
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error-message'

// Gardez votre hook existant pour les composants React
export const useGetTypeActivites = () => {
  return useQuery({
    queryKey: ['types-activite'],
    queryFn: () => typeActiviteService.getAll()
  });
};

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getTypeActivites = async () => {
  const response = await typeActiviteService.getAll();
  return response;
};

export const useSaveTypeActivite = (
  isEdit: boolean,
  currentRow?: any,
  onSuccess?: () => void
) => {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) =>
      isEdit && currentRow?.id_type
        ? typeActiviteService.update(currentRow.id_type, data)
        : typeActiviteService.create(data),

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["types-activite"],
      })

      toast.success(
        isEdit
          ? "Type d'activité modifié"
          : "Type d'activité créé"
      )

      onSuccess?.()
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteTypeActivite = () => {

  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => typeActiviteService.delete(id),

    onSuccess: async () => {

      await queryClient.invalidateQueries({
        queryKey: ["types-activite"],
      })
      toast.success("Type supprimé")
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}