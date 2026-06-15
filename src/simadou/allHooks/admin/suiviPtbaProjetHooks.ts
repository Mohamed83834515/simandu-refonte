import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import suiviTacheActiviteProjetService from '@/simadou/allSercices/suiviTacheActiviteProjetService'
import suiviIndicateurTacheProjetService from '@/simadou/allSercices/suiviIndicateurTacheProjetService'
import suiviAvancementContratProjetService from '@/simadou/allSercices/suiviAvancementContratProjetService'
import suiviDecaissementPtbaProjetService from '@/simadou/allSercices/suiviDecaissementPtbaProjetService'
import sourceVerificationSuiviAvancementContratService from '@/simadou/allSercices/sourceVerificationSuiviAvancementContratService'
import type { SuiviTacheActivite, TacheActivitePtba } from '@/simadou/allTypes'
import { resolveIdActivite } from '@/simadou/allTypes/tacheActivitePtba'
import { tauxAvancementGlobalTaches } from '@/simadou/allTypes/suiviTacheActivite'
import type { SuiviIndicateurTacheProjetPayload } from '@/simadou/schemas/suiviIndicateurTacheProjetSchemas'
import type { SuiviTacheActiviteProjetPayload } from '@/simadou/schemas/suiviTacheActiviteProjetSchemas'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import type { SuiviDecaissementPtbaProjetFormData } from '@/simadou/schemas/suiviDecaissementPtbaProjetSchemas'
import type { SuiviAvancementWithSourcesInput } from '@/simadou/allSercices/suiviAvancementContratService'
import {
  useGetAllTachesActiviteProjet,
  suiviPtbaQueryKeys as tacheProjetQueryKeys,
} from '@/simadou/allHooks/admin/tacheActiviteProjetHooks'

export { useGetLocalites } from './sharedHooks'
export { useGetIndicateursProjetByActivite } from './indicateurTacheProjetHooks'

export const suiviPtbaProjetQueryKeys = {
  suiviTache: (idActivite: number) =>
    ['suivi-ptba-projet', 'suivi-tache', idActivite] as const,
  suiviAvancement: (idActivite: number) =>
    ['suivi-ptba-projet', 'suivi-avancement', idActivite] as const,
  suiviAvancementSources: (idSuivi: number) =>
    ['suivi-ptba-projet', 'suivi-avancement-sources', idSuivi] as const,
  suivisIndicateurs: ['suivi-ptba-projet', 'suivis-indicateurs'] as const,
  suivisIndicateur: (idIndicateur: number) =>
    ['suivi-ptba-projet', 'suivis-indicateurs', idIndicateur] as const,
  suiviDecaissement: (idActivite: number) =>
    ['suivi-ptba-projet', 'suivi-decaissement', idActivite] as const,
}

export const useGetSuiviTachesProjetByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suiviTache(idActivite),
    queryFn: () => suiviTacheActiviteProjetService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

export function useSuiviTachesProjetByActiviteIds(activiteIds: number[]) {
  const queries = useQueries({
    queries: activiteIds.map((id) => ({
      queryKey: suiviPtbaProjetQueryKeys.suiviTache(id),
      queryFn: () => suiviTacheActiviteProjetService.getByActivite(id),
      enabled: Number.isFinite(id),
    })),
  })

  const suivisByActivite = new Map<number, SuiviTacheActivite[]>()
  activiteIds.forEach((id, index) => {
    suivisByActivite.set(id, queries[index]?.data ?? [])
  })

  return {
    queries,
    suivisByActivite,
    isLoading: queries.some((q) => q.isLoading),
  }
}

export function useSuiviPtbaProjetActivitesProgress(activiteIds: number[]) {
  const activiteIdSet = new Set(activiteIds)
  const { data: allTaches = [], isLoading: tachesLoading } =
    useGetAllTachesActiviteProjet(activiteIds.length > 0)
  const { suivisByActivite, isLoading: suivisLoading } =
    useSuiviTachesProjetByActiviteIds(activiteIds)

  const tachesByActivite = new Map<number, TacheActivitePtba[]>()
  for (const id of activiteIds) {
    tachesByActivite.set(id, [])
  }
  for (const tache of allTaches) {
    const activiteId = resolveIdActivite(tache)
    if (activiteId == null || !activiteIdSet.has(activiteId)) continue
    const list = tachesByActivite.get(activiteId) ?? []
    list.push(tache)
    tachesByActivite.set(activiteId, list)
  }

  const avancementByActivite = new Map<number, number>()
  for (const id of activiteIds) {
    const taches = tachesByActivite.get(id) ?? []
    const suivis = suivisByActivite.get(id) ?? []
    avancementByActivite.set(id, tauxAvancementGlobalTaches(taches, suivis))
  }

  return {
    tachesByActivite,
    suivisByActivite,
    avancementByActivite,
    isLoading: tachesLoading || suivisLoading,
  }
}

export const useGetSuiviAvancementProjetByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suiviAvancement(idActivite),
    queryFn: () => suiviAvancementContratProjetService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

export const useGetSuiviAvancementProjetSources = (idSuivi?: number) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suiviAvancementSources(idSuivi ?? 0),
    queryFn: () =>
      sourceVerificationSuiviAvancementContratService.getBySuivi(idSuivi!),
    enabled: Number.isFinite(idSuivi) && (idSuivi ?? 0) > 0,
  })

export const useGetAllSuivisIndicateursProjet = (enabled = true) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suivisIndicateurs,
    queryFn: () => suiviIndicateurTacheProjetService.getAll(),
    enabled,
  })

export const useGetSuivisIndicateurProjetByIndicateur = (
  idIndicateur: number,
  enabled = true
) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suivisIndicateur(idIndicateur),
    queryFn: () =>
      suiviIndicateurTacheProjetService.getByIndicateur(idIndicateur),
    enabled: enabled && Number.isFinite(idIndicateur) && idIndicateur > 0,
  })

export const useGetSuiviDecaissementProjetByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaProjetQueryKeys.suiviDecaissement(idActivite),
    queryFn: () => suiviDecaissementPtbaProjetService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

export const useCreateSuiviTacheProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviTacheActiviteProjetPayload) =>
      suiviTacheActiviteProjetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviTache(idActivite),
      })
      queryClient.invalidateQueries({
        queryKey: tacheProjetQueryKeys.tachesAll,
      })
    },
  })
}

export const useUpdateSuiviTacheProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviTacheActiviteProjetPayload
    }) => suiviTacheActiviteProjetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviTache(idActivite),
      })
      queryClient.invalidateQueries({
        queryKey: tacheProjetQueryKeys.tachesAll,
      })
    },
  })
}

export const useCreateSuiviIndicateurProjet = (idIndicateur?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviIndicateurTacheProjetPayload) =>
      suiviIndicateurTacheProjetService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suivisIndicateurs,
      })
      if (idIndicateur != null) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaProjetQueryKeys.suivisIndicateur(idIndicateur),
        })
      }
    },
  })
}

export const useUpdateSuiviIndicateurProjet = (idIndicateur?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviIndicateurTacheProjetPayload
    }) => suiviIndicateurTacheProjetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suivisIndicateurs,
      })
      if (idIndicateur != null) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaProjetQueryKeys.suivisIndicateur(idIndicateur),
        })
      }
    },
  })
}

export const useDeleteSuiviIndicateurProjet = (idIndicateur?: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviIndicateurTacheProjetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suivisIndicateurs,
      })
      if (idIndicateur != null) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaProjetQueryKeys.suivisIndicateur(idIndicateur),
        })
      }
    },
  })
}

export const useCreateSuiviAvancementProjetWithSources = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SuiviAvancementWithSourcesInput) =>
      suiviAvancementContratProjetService.createWithSources(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useUpdateSuiviAvancementProjetWithSources = (
  idActivite: number
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: SuiviAvancementWithSourcesInput
    }) => suiviAvancementContratProjetService.updateWithSources(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useDeleteSuiviAvancementProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviAvancementContratProjetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useCreateSuiviDecaissementProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviDecaissementPtbaProjetFormData) =>
      suiviDecaissementPtbaProjetService.create(idActivite, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}

export const useUpdateSuiviDecaissementProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      existing,
    }: {
      id: number
      data: SuiviDecaissementPtbaProjetFormData
      existing?: Pick<
        SuiviDecaissementPtbaProjet,
        'periode_suivi_dec' | 'taux_dollars_jour'
      >
    }) =>
      suiviDecaissementPtbaProjetService.update(id, idActivite, data, existing),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}

export const useDeleteSuiviDecaissementProjet = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviDecaissementPtbaProjetService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaProjetQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}
