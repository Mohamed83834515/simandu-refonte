import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { RecommandationMissionProjetApiPayload } from '@/simadou/allTypes/recommandationMissionProjet'
import recommandationMissionProjetService from '@/simadou/allSercices/recommandationMissionProjetService'

export const recommandationMissionProjetQueryKeys = {
  all: ['recommandations-missions-projets'] as const,
  byProjet: (idProjet: number) =>
    ['recommandations-missions-projets', idProjet] as const,
}

export const useGetRecommandationsMissionProjet = (idProjet?: number) =>
  useQuery({
    queryKey: recommandationMissionProjetQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => recommandationMissionProjetService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useCreateRecommandationMissionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: RecommandationMissionProjetApiPayload
      file?: File
    }) => recommandationMissionProjetService.create(data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Recommandation ajoutée avec succès')
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'ajout de la recommandation")
      )
    },
  })
}

export const useUpdateRecommandationMissionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: number
      data: Partial<RecommandationMissionProjetApiPayload>
      file?: File
    }) => recommandationMissionProjetService.update(id, data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Recommandation modifiée avec succès')
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          'Erreur lors de la modification de la recommandation'
        )
      )
    },
  })
}

export const useDeleteRecommandationMissionProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => recommandationMissionProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Recommandation supprimée avec succès')
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({
        queryKey: recommandationMissionProjetQueryKeys.all,
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          'Erreur lors de la suppression de la recommandation'
        )
      )
    },
  })
}
