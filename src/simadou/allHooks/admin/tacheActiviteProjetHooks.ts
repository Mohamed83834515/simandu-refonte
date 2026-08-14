import tacheActivitePtbaService from "@/simadou/allSercices/tacheActivitePtbaService";
import type { TacheActivitePtba } from "@/simadou/allTypes/tacheActivitePtba";
import {
  mergeTacheActivitePtbaInCache,
  type TacheActivitePtbaApiPayload,
} from "@/simadou/lib/tacheActivitePtbaUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "/tache-activite-ptba-projets/"

export const suiviPtbaQueryKeys = {
    tachesAll: ['taches-activite-projet-all'] as const,
    tachesActivite: (idActivite: number) =>
        ['taches-activite-projet', idActivite] as const,
}

export const useGetAllTachesActiviteProjet = (enabled = true) =>
    useQuery({
        queryKey: suiviPtbaQueryKeys.tachesAll,
        queryFn: () => tacheActivitePtbaService.getAll(BASE_URL),
        enabled,
    })

export const useGetTachesByActiviteProjet = (idActivite: number) =>
    useQuery({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
        queryFn: () => tacheActivitePtbaService.getByActivite(BASE_URL, idActivite),
        enabled: Number.isFinite(idActivite),
    })


export const useCreateTacheActiviteProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: TacheActivitePtbaApiPayload
    ) => tacheActivitePtbaService.create(BASE_URL, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (created, variables) => {
      queryClient.setQueryData<TacheActivitePtba[]>(
        suiviPtbaQueryKeys.tachesActivite(idActivite),
        (current) =>
          mergeTacheActivitePtbaInCache(current, created, idActivite, variables)
      )
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
        refetchType: 'none',
      })
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesAll,
        refetchType: 'none',
      })
    },
  })
}

export const useUpdateTacheActiviteProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: TacheActivitePtbaApiPayload
    }) => tacheActivitePtbaService.update(BASE_URL, id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<TacheActivitePtba[]>(
        suiviPtbaQueryKeys.tachesActivite(idActivite),
        (current) =>
          mergeTacheActivitePtbaInCache(
            current,
            updated,
            idActivite,
            variables.data
          )
      )
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(idActivite),
        refetchType: 'none',
      })
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesAll,
        refetchType: 'none',
      })
    },
  })
}


export const useDeleteTachePtbaProjet = (id_ptba: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tacheActivitePtbaService.delete(BASE_URL, id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<TacheActivitePtba[]>(
        suiviPtbaQueryKeys.tachesActivite(id_ptba),
        (current = []) =>
          current.filter((item) => item.id_groupe_tache !== deletedId)
      )
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.tachesActivite(id_ptba),
        refetchType: 'none',
      })
    },
  })
}
