import indicateurTacheService from "@/simadou/allSercices/indicateurTacheService";
import type { IndicateurTacheRequest } from "@/simadou/allTypes/indicateurTache";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = "/indicateurs-taches-projets/"

export const suiviPtbaQueryKeys = {
    indicateurs: (id_ptba: number) =>
        ['indicateurs-tache-projet', id_ptba] as const,
    localites: ['localites'] as const,
}

export const useGetIndicateursProjetByActivite = (id_ptba: number) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.indicateurs(id_ptba),
    queryFn: () => indicateurTacheService.getByActivite(BASE_URL, id_ptba),
    enabled: !!id_ptba,
  })

export const useCreateIndicateurTacheProjet = (id_ptba: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurTacheRequest) =>
      indicateurTacheService.create(BASE_URL, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.indicateurs(id_ptba),
      })
    },
  })
}

export const useUpdateIndicateurTacheProjet = (id_ptba: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurTacheRequest>
    }) => indicateurTacheService.update(BASE_URL, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.indicateurs(id_ptba),
      })
    },
  })
}

export const useDeleteSuiviIndicateurProjet = (id_ptba: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurTacheService.delete(BASE_URL, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.indicateurs(id_ptba),
      })
    },
  })
}
