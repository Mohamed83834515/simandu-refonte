import tacheActivitePtbaService from "@/simadou/allSercices/tacheActivitePtbaService";
import type { TacheActivitePtbaApiPayload } from "@/simadou/lib/tacheActivitePtbaUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "/tache_activite_ptba/"

export const suiviPtbaQueryKeys = {
    tachesAll: ['taches-activite-all'] as const,
    tachesActivite: (idActivite: number) =>
        ['taches-activite', idActivite] as const,
}

export const useGetAllTachesActivite = (enabled = true) =>
    useQuery({
        queryKey: suiviPtbaQueryKeys.tachesAll,
        queryFn: () => tacheActivitePtbaService.getAll(BASE_URL),
        enabled,
    })

export const useGetTachesByActivite = (idActivite: number) =>
    useQuery({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
        queryFn: () => tacheActivitePtbaService.getByActivite(BASE_URL, idActivite),
        enabled: Number.isFinite(idActivite),
    })


export const useCreateTacheActivite = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: TacheActivitePtbaApiPayload
    ) => tacheActivitePtbaService.create(BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
      })
      queryClient.invalidateQueries({ queryKey: suiviPtbaQueryKeys.tachesAll })
    },
  })
}

export const useUpdateTacheActivite = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: TacheActivitePtbaApiPayload
    }) => tacheActivitePtbaService.update(BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
      })
      queryClient.invalidateQueries({ queryKey: suiviPtbaQueryKeys.tachesAll })
    },
  })
}


export const useDeleteTachePtba = (id_ptba: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tacheActivitePtbaService.delete(BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(id_ptba),
      })
    },
  })
}