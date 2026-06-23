import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { FinancementProjetApiPayload } from '@/simadou/allTypes/financementProjet'
import financementProjetService from '@/simadou/allSercices/financementProjetService'

export const financementProjetQueryKeys = {
  all: ['types-parts'] as const,
  byProjet: (idProjet: number) => ['types-parts', idProjet] as const,
}

export const useGetFinancementsProjet = (idProjet?: number) =>
  useQuery({
    queryKey: financementProjetQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => financementProjetService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useCreateFinancementProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FinancementProjetApiPayload) =>
      financementProjetService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Financement ajouté avec succès')
      queryClient.invalidateQueries({
        queryKey: financementProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: financementProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'ajout du financement")
      )
    },
  })
}

export const useUpdateFinancementProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: FinancementProjetApiPayload
    }) => financementProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Financement modifié avec succès')
      queryClient.invalidateQueries({
        queryKey: financementProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: financementProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification du financement')
      )
    },
  })
}

export const useDeleteFinancementProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => financementProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Financement supprimé avec succès')
      queryClient.invalidateQueries({
        queryKey: financementProjetQueryKeys.byProjet(idProjet),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression du financement')
      )
    },
  })
}
