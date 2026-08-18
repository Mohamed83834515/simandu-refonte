// simadou/allHooks/admin/niveauLocaliteHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { niveauLocaliteService } from '@/simadou/allSercices/niveauLocaliteService'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
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
      toast.success('Niveaux Localites ajoutés avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de l\'ajout des niveaux'))
    },
  })
}

export const useUpdateNiveauLocalite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauLocalite) => niveauLocaliteService.update(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: niveauLocaliteQueryKeys.list() })
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la mise à jour du niveau'))
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression'))
    },
  })
}