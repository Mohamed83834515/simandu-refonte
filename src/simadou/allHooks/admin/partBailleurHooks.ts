import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { PartBailleurApiPayload } from '@/simadou/allTypes/partBailleur'
import partBailleurService, {
  type PartBailleurActiviteQuery,
} from '@/simadou/allSercices/partBailleurService'

export const partBailleurQueryKeys = {
  all: ['parts-bailleurs'] as const,
  byActivite: (query: PartBailleurActiviteQuery) =>
    [
      'parts-bailleurs',
      query.activitePtbaId,
      query.projetId,
      query.versionPtbaId,
    ] as const,
}

export const useGetPartsBailleursByActivite = (
  query: PartBailleurActiviteQuery | null
) =>
  useQuery({
    queryKey: query
      ? partBailleurQueryKeys.byActivite(query)
      : partBailleurQueryKeys.all,
    queryFn: () => partBailleurService.getByActivite(query!.activitePtbaId, query!.projetId),
    enabled:
      query != null &&
      query.activitePtbaId > 0 &&
      query.projetId > 0 &&
      query.versionPtbaId > 0,
    refetchOnMount: 'always',
  })

export const useCreatePartBailleur = (query: PartBailleurActiviteQuery) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PartBailleurApiPayload) =>
      partBailleurService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partBailleurQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: partBailleurQueryKeys.byActivite(query),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'enregistrement du coût")
      )
    },
  })
}

export const useUpdatePartBailleur = (query: PartBailleurActiviteQuery) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: PartBailleurApiPayload
    }) => partBailleurService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partBailleurQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: partBailleurQueryKeys.byActivite(query),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification du coût')
      )
    },
  })
}

export const useDeletePartBailleur = (query: PartBailleurActiviteQuery) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => partBailleurService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partBailleurQueryKeys.all })
      queryClient.invalidateQueries({
        queryKey: partBailleurQueryKeys.byActivite(query),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression du coût')
      )
    },
  })
}
