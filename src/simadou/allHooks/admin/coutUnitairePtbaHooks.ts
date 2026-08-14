import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import coutUnitairePtbaService from '@/simadou/allSercices/coutUnitairePtbaService'
import type { CoutUnitairePtbaApiPayload } from '@/simadou/lib/coutUnitairePtbaUtils'

const BASE_URL = '/couts-unitaires-ptba/'

export const coutUnitairePtbaQueryKeys = {
  all: ['couts-unitaires-ptba'] as const,
  byActivite: (idActivite: number) =>
    ['couts-unitaires-ptba', idActivite] as const,
}

export const useGetCoutsUnitaires = () =>
  useQuery({
    queryKey: coutUnitairePtbaQueryKeys.all,
    queryFn: () =>
      coutUnitairePtbaService.getAll(BASE_URL),
  })
export const useGetCoutsUnitairesByActivite = (idActivite: number) =>
  useQuery({
    queryKey: coutUnitairePtbaQueryKeys.byActivite(idActivite),
    queryFn: () =>
      coutUnitairePtbaService.getByActivite(BASE_URL, idActivite),
    enabled: Number.isFinite(idActivite) && idActivite > 0,
  })

export const useCreateCoutUnitairePtba = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CoutUnitairePtbaApiPayload) =>
      coutUnitairePtbaService.create(BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: coutUnitairePtbaQueryKeys.byActivite(idActivite),
      })
      queryClient.invalidateQueries({
        queryKey: coutUnitairePtbaQueryKeys.all,
      })
    },
  })
}

export const useUpdateCoutUnitairePtba = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CoutUnitairePtbaApiPayload
    }) => coutUnitairePtbaService.update(BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: coutUnitairePtbaQueryKeys.byActivite(idActivite),
      })
      queryClient.invalidateQueries({
        queryKey: coutUnitairePtbaQueryKeys.all,
      })
    },
  })
}

export const useDeleteCoutUnitairePtba = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      coutUnitairePtbaService.delete(BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: coutUnitairePtbaQueryKeys.byActivite(idActivite),
      })
    },
  })
}
