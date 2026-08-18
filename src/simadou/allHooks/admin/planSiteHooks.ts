import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { planSiteService } from '@/simadou/allSercices/planSiteService';
import { PlanSite } from '@/simadou/allTypes';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error-message'

// Gardez votre hook existant pour les composants React
export const useGetPlanSites = () => {
  return useQuery({
    queryKey: ['plans-sites'],
    queryFn: () => planSiteService.getAll()
  });
};

// Ajoutez cette fonction pour une utilisation en dehors des composants React
export const getPlanSites = async () => {
  const response = await planSiteService.getAll();
  return response;
};


export const planSiteQueryKeys = {
  all: ['plans-site'] as const,
  allPlans: () => [...planSiteQueryKeys.all, 'list'] as const,
}

export const useGetAllPlansSite = () => {
  return useQuery({
    queryKey: planSiteQueryKeys.allPlans(),
    queryFn: () => planSiteService.getAll(),
  })
}

export const useSavePlanSite = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanSite) => {
      if (isEdit && currentRow?.id_ds) {
        return planSiteService.update(currentRow.id_ds, data)
      }
      return planSiteService.create(data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planSiteQueryKeys.allPlans() })
      toast.success(isEdit ? 'Plan site modifié' : 'Plan site créé')
      onSuccess?.()
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Une erreur est survenue')),
  })
}

export const useDeletePlanSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => planSiteService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planSiteQueryKeys.allPlans() })
      toast.success('Plan site supprimé')
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression')),
  })
}