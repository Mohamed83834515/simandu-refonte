import { niveauStructureConfigService } from '@/simadou/allSercices/niveauStructureConfigService'
import { NiveauStructureConfigFormData } from '@/simadou/allTypes/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
    onError: (error: any) => {
      console.error('Erreur lors de la création des niveaux:', error)
      toast.error('Erreur lors de l\'ajout des niveaux')
    },
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
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
