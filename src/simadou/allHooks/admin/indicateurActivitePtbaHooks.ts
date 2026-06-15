import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import indicateurActivitePtbaService from '@/simadou/allSercices/indicateurActivitePtbaService'
import type { Ptba } from '@/simadou/allTypes'
import type { IndicateurActivitePtbaFormData } from '@/simadou/schemas/activiteProjetSchemas'

export const indicateurActivitePtbaQueryKeys = {
  all: ['indicateurs-activite-ptba'] as const,
  forActivite: (codeActivite: string, idActivite: number) =>
    ['indicateurs-activite-ptba', codeActivite, idActivite] as const,
}

export const useGetIndicateursActivitePtbaForActivite = (activite: Ptba | null) =>
  useQuery({
    queryKey: indicateurActivitePtbaQueryKeys.forActivite(
      activite?.code_activite_ptba ?? '',
      activite?.id_ptba ?? 0
    ),
    queryFn: () =>
      activite ? indicateurActivitePtbaService.getForActivite(activite) : [],
    enabled: !!activite,
  })

function invalidateIndicateurQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  activite: Ptba | null
) {
  queryClient.invalidateQueries({
    queryKey: indicateurActivitePtbaQueryKeys.all,
  })
  if (activite) {
    queryClient.invalidateQueries({
      queryKey: indicateurActivitePtbaQueryKeys.forActivite(
        activite.code_activite_ptba ?? '',
        activite.id_ptba
      ),
    })
  }
}

export const useCreateIndicateurActivitePtba = (activite: Ptba | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurActivitePtbaFormData) =>
      indicateurActivitePtbaService.create(data),
    onSuccess: () => invalidateIndicateurQueries(queryClient, activite),
  })
}

export const useUpdateIndicateurActivitePtba = (activite: Ptba | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurActivitePtbaFormData>
    }) => indicateurActivitePtbaService.update(id, data),
    onSuccess: () => invalidateIndicateurQueries(queryClient, activite),
  })
}

export const useDeleteIndicateurActivitePtba = (activite: Ptba | null) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurActivitePtbaService.delete(id),
    onSuccess: () => invalidateIndicateurQueries(queryClient, activite),
  })
}
