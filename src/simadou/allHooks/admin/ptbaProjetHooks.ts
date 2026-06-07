import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import ptbaProjetService from '@/simadou/allSercices/ptbaProjetService'
import type { PtbaProjetFormData } from '@/simadou/schemas/ptbaProjetSchemas'

export const ptbaProjetQueryKeys = {
  all: ['ptbas-projets'] as const,
  byProjet: (codeProjet: string) =>
    ['ptbas-projets', codeProjet] as const,
}

export const useGetPtbasProjet = (codeProjet?: string) =>
  useQuery({
    queryKey: ptbaProjetQueryKeys.byProjet(codeProjet ?? ''),
    queryFn: () => ptbaProjetService.getByProjet(codeProjet!),
    enabled: !!codeProjet,
  })

export const useCreatePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PtbaProjetFormData) => ptbaProjetService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet créée avec succès')
      queryClient.invalidateQueries({ queryKey: ptbaProjetQueryKeys.all })
      if (codeProjet) {
        queryClient.invalidateQueries({
          queryKey: ptbaProjetQueryKeys.byProjet(codeProjet),
        })
      }
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la création de l'activité PTBA projet"
        )
      )
    },
  })
}

export const useUpdatePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<PtbaProjetFormData>
    }) => ptbaProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ptbaProjetQueryKeys.all })
      if (codeProjet) {
        queryClient.invalidateQueries({
          queryKey: ptbaProjetQueryKeys.byProjet(codeProjet),
        })
      }
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la modification de l'activité PTBA projet"
        )
      )
    },
  })
}

export const useDeletePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ptbaProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ptbaProjetQueryKeys.all })
      if (codeProjet) {
        queryClient.invalidateQueries({
          queryKey: ptbaProjetQueryKeys.byProjet(codeProjet),
        })
      }
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la suppression de l'activité PTBA projet"
        )
      )
    },
  })
}
