import { niveauStructureConfigService } from '@/simadou/allSercices/niveauStructureConfigService'
import { NiveauStructureConfigFormData } from '@/simadou/allTypes/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'

export const niveauPlanSiteQueryKeys = {
  all: ['niveaux-structures'] as const,
  list: () => [...niveauPlanSiteQueryKeys.all, 'list'] as const,
}

export const useGetNiveauxPlanSite = () => {
  return useQuery({
    queryKey: niveauPlanSiteQueryKeys.list(),
    queryFn: () => niveauStructureConfigService.getAll(),
  })
}

export const useSaveNiveauxPlanSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (niveaux: NiveauStructureConfigFormData[]) => {
      // Créer les niveaux un par un avec Promise.all
      const promises = niveaux.map((niveau) => 
        niveauStructureConfigService.create(niveau)
      )
      return await Promise.all(promises)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauPlanSiteQueryKeys.list() })
      toast.success('Niveaux ajoutés avec succès')
    },
    onError: (error: unknown) => {
      console.error('Erreur lors de la création des niveaux:', error)
      toast.error(getApiErrorMessage(error, 'Erreur lors de l\'ajout des niveaux'))
    },
  })
}

export const useUpdateNiveauPlanSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauStructureConfigFormData & { id_nsc: number }) => {
      const { id_nsc, ...payload } = data
      return niveauStructureConfigService.update(id_nsc, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauPlanSiteQueryKeys.list() })
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Erreur lors de la modification du niveau')),
  })
}

export const useDeleteNiveauPlanSite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauStructureConfigService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauPlanSiteQueryKeys.list() })
      toast.success('Niveau supprimé avec succès')
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression')),
  })
}
