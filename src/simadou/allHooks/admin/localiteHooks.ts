import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { localiteService } from '@/simadou/allSercices/localiteService';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error-message'
import { Localite } from '@/simadou/allTypes';

// Gardez votre hook existant pour les composants React
export const useGetLocalites = () => {
  return useQuery({
    queryKey: ['localites'],
    queryFn: () => localiteService.getAll()
  });
};

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getLocalites = async () => {
  const response = await localiteService.getAll();
  return response;
};

export const localiteQueryKeys = {
  niveaux: ['niveaux-localites'] as const,
  allLocalites: ['all-localites'] as const,
  localitesByNiveau: (niveauId: number) => ['localites', 'niveau', niveauId] as const,
  localitesByParent: (parentId: number | null) => ['localites', 'parent', parentId] as const,
}

// ✅ Récupérer toutes les localités (utile pour le cache)
export const useGetAllLocalites = () => {
  return useQuery({
    queryKey: localiteQueryKeys.allLocalites,
    queryFn: () => localiteService.getAll(),
  })
}

// ✅ Récupérer les localités par niveau (filtrage côté frontend)
// simadou/allHooks/admin/localiteHooks.ts
export const useGetLocalitesByNiveau = (niveauId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: localiteQueryKeys.localitesByNiveau(niveauId),
    queryFn: () => localiteService.getByNiveau(niveauId),
    enabled: options?.enabled !== undefined ? options.enabled : !!niveauId && niveauId > 0,
  })
}

export const useGetLocalitesByParent = (parentId: number | null) => {
  return useQuery({
    queryKey: localiteQueryKeys.localitesByParent(parentId),
    queryFn: () => localiteService.getByParent(parentId),
    enabled: parentId !== undefined,
  })
}

export const useSaveLocalite = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Localite) => {
      if (isEdit && currentRow?.id_loca) {
        return localiteService.update({ ...data, id_loca: currentRow.id_loca })
      } else {
        return localiteService.create(data)
      }
    },
    onSuccess: async (_, variables) => {
      // Invalider toutes les requêtes de localités
      await queryClient.invalidateQueries({ queryKey: localiteQueryKeys.allLocalites })
      await queryClient.invalidateQueries({
        queryKey: localiteQueryKeys.localitesByNiveau(variables.niveau_loca as number)
      })
      toast.success(isEdit ? 'Localité modifiée avec succès' : 'Localité créée avec succès')
      onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Une erreur est survenue'))
    },
  })
}

export const useDeleteLocalite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => localiteService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: localiteQueryKeys.allLocalites })
      await queryClient.invalidateQueries({ queryKey: localiteQueryKeys.niveaux })
      toast.success('Localité supprimée avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}
