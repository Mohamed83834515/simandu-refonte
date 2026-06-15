// simadou/allHooks/admin/niveauLocaliteHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { niveauLocaliteService } from '@/simadou/allSercices/niveauLocaliteService'
import { toast } from 'sonner'
import { NiveauLocalite } from '@/simadou/allTypes/niveauLocalite'

export const niveauLocaliteQueryKeys = {
  all: ['niveaux-localites'] as const,
  list: () => [...niveauLocaliteQueryKeys.all, 'list'] as const,
}

export const useGetNiveauxLocalite = () => {
  return useQuery({
    queryKey: niveauLocaliteQueryKeys.list(),
    queryFn: () => niveauLocaliteService.getAll(),
  })
}

export const useSaveNiveauxLocalite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauLocalite[]) => {
      return niveauLocaliteService.create(data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauLocaliteQueryKeys.list() })
      toast.success('Niveaux ajoutés avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de l\'ajout des niveaux')
    },
  })
}

export const useDeleteNiveauLocalite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauLocaliteService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauLocaliteQueryKeys.list() })
      toast.success('Niveau supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}