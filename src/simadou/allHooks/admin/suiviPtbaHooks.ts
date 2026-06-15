import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import suiviTacheActiviteService from '@/simadou/allSercices/suiviTacheActiviteService'
import tacheActivitePtbaService from '@/simadou/allSercices/tacheActivitePtbaService'
import suiviAvancementContratService from '@/simadou/allSercices/suiviAvancementContratService'
import sourceVerificationSuiviAvancementContratService from '@/simadou/allSercices/sourceVerificationSuiviAvancementContratService'
import observationPtbaService from '@/simadou/allSercices/observationPtbaService'
import suiviIndicateurActiviteService from '@/simadou/allSercices/suiviIndicateurActiviteService'
import suiviDecaissementPtbaService from '@/simadou/allSercices/suiviDecaissementPtbaService'
export { useGetLocalites } from './sharedHooks'
export { useGetIndicateursByActivite } from './indicateurTacheHooks'
import type { SuiviTacheActivite, TacheActivitePtba } from '@/simadou/allTypes'
import { resolveIdActivite } from '@/simadou/allTypes/tacheActivitePtba'
import { tauxAvancementGlobalTaches } from '@/simadou/allTypes/suiviTacheActivite'
import type { SuiviIndicateurActiviteFormData } from '@/simadou/schemas/suiviIndicateurSchemas'
import type { SuiviTacheActiviteFormData } from '@/simadou/schemas/suiviTacheActiviteSchemas'
import type { ObservationPtbaFormData } from '@/simadou/schemas/observationPtbaSchemas'
import type { SuiviDecaissementPtbaFormData } from '@/simadou/schemas/suiviDecaissementPtbaSchemas'
import type { SuiviDecaissementPtba } from '@/simadou/allTypes/decaissementPtba'
import type {
  SuiviAvancementContratPayload,
  SuiviAvancementWithSourcesInput,
} from '@/simadou/allSercices/suiviAvancementContratService'


const BASE_URL = "/tache_activite_ptba/"

export const suiviPtbaQueryKeys = {
  tachesAll: ['taches-activite-all'] as const,
  suiviTache: (idActivite: number) =>
    ['suivi-tache-activite', idActivite] as const,
  tachesActivite: (idActivite: number) =>
    ['taches-activite', idActivite] as const,
  suiviAvancement: (idActivite: number) =>
    ['suivi-avancement-contrat', idActivite] as const,
  suiviAvancementSources: (idSuivi: number) =>
    ['suivi-avancement-sources', idSuivi] as const,
  observations: (codeActivite: string) =>
    ['observations-ptba', codeActivite] as const,
  suivisIndicateurs: ['suivis-indicateurs-all'] as const,
  suivisIndicateur: (codeIndicateur: string) =>
    ['suivis-indicateurs', codeIndicateur] as const,
  suiviDecaissement: (idActivite: number) =>
    ['suivi-ptba', 'suivi-decaissement', idActivite] as const,
  localites: ['localites'] as const,
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

export const useGetSuiviTachesByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suiviTache(idActivite),
    queryFn: () => suiviTacheActiviteService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

/** Suivis tâche pour plusieurs activités (tableau principal suivi PTBA). */
export function useSuiviTachesByActiviteIds(activiteIds: number[]) {
  const queries = useQueries({
    queries: activiteIds.map((id) => ({
      queryKey: suiviPtbaQueryKeys.suiviTache(id),
      queryFn: () => suiviTacheActiviteService.getByActivite(id),
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

/** Tâches groupées + avancement % par activité (tableau principal). */
export function useSuiviPtbaActivitesProgress(activiteIds: number[]) {
  const activiteIdSet = new Set(activiteIds)
  const { data: allTaches = [], isLoading: tachesLoading } =
    useGetAllTachesActivite(activiteIds.length > 0)
  const { suivisByActivite, isLoading: suivisLoading } =
    useSuiviTachesByActiviteIds(activiteIds)

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

export const useGetSuiviAvancementByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suiviAvancement(idActivite),
    queryFn: () => suiviAvancementContratService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

export const useGetSuiviAvancementSources = (idSuivi?: number) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suiviAvancementSources(idSuivi ?? 0),
    queryFn: () =>
      sourceVerificationSuiviAvancementContratService.getBySuivi(idSuivi!),
    enabled: Number.isFinite(idSuivi) && (idSuivi ?? 0) > 0,
  })

export const useGetObservationsByActivite = (codeActivite: string) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.observations(codeActivite),
    queryFn: () => observationPtbaService.getByActivite(codeActivite),
    enabled: !!codeActivite,
  })

export const useGetAllSuivisIndicateurs = (enabled = true) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
    queryFn: () => suiviIndicateurActiviteService.getAll(),
    enabled,
  })

export const useGetSuivisIndicateurByIndicateur = (
  codeIndicateur: string,
  enabled = true
) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suivisIndicateur(codeIndicateur),
    queryFn: () =>
      suiviIndicateurActiviteService.getByIndicateur(codeIndicateur),
    enabled: enabled && !!codeIndicateur,
  })

export const useGetSuiviDecaissementByActivite = (idActivite: number) =>
  useQuery({
    queryKey: suiviPtbaQueryKeys.suiviDecaissement(idActivite),
    queryFn: () => suiviDecaissementPtbaService.getByActivite(idActivite),
    enabled: Number.isFinite(idActivite),
  })

export const useCreateSuiviTache = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: SuiviTacheActiviteFormData & {
        id_activite_ptba: number
        id_groupe_tache: number
      }
    ) => suiviTacheActiviteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviTache(idActivite),
      })
      queryClient.invalidateQueries({ queryKey: suiviPtbaQueryKeys.tachesAll })
    },
  })
}

export const useUpdateSuiviTache = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviTacheActiviteFormData & {
        id_activite_ptba: number
        id_groupe_tache: number
      }
    }) => suiviTacheActiviteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviTache(idActivite),
      })
      queryClient.invalidateQueries({ queryKey: suiviPtbaQueryKeys.tachesAll })
    },
  })
}

export const useCreateSuiviIndicateur = (codeIndicateur?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviIndicateurActiviteFormData) =>
      suiviIndicateurActiviteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
      })
      if (codeIndicateur) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaQueryKeys.suivisIndicateur(codeIndicateur),
        })
      }
    },
  })
}

export const useUpdateSuiviIndicateur = (codeIndicateur?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviIndicateurActiviteFormData
    }) => suiviIndicateurActiviteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
      })
      if (codeIndicateur) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaQueryKeys.suivisIndicateur(codeIndicateur),
        })
      }
    },
  })
}

export const useDeleteSuiviIndicateur = (codeIndicateur?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviIndicateurActiviteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
      })
      if (codeIndicateur) {
        queryClient.invalidateQueries({
          queryKey: suiviPtbaQueryKeys.suivisIndicateur(codeIndicateur),
        })
      }
    },
  })
}

export const useCreateSuiviAvancementWithSources = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SuiviAvancementWithSourcesInput) =>
      suiviAvancementContratService.createWithSources(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useUpdateSuiviAvancementWithSources = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: SuiviAvancementWithSourcesInput
    }) => suiviAvancementContratService.updateWithSources(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useDeleteSuiviAvancement = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviAvancementContratService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviAvancement(idActivite),
      })
    },
  })
}

export const useCreateObservationPtba = (codeActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ObservationPtbaFormData) =>
      observationPtbaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.observations(codeActivite),
      })
    },
  })
}

export const useUpdateObservationPtba = (codeActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: ObservationPtbaFormData
    }) => observationPtbaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.observations(codeActivite),
      })
    },
  })
}

export const useDeleteObservationPtba = (codeActivite: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => observationPtbaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.observations(codeActivite),
      })
    },
  })
}

export const useCreateSuiviDecaissement = (
  idActivite: number,
  codeProgramme: string
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviDecaissementPtbaFormData) =>
      suiviDecaissementPtbaService.create(idActivite, data, codeProgramme),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}

export const useUpdateSuiviDecaissement = (
  idActivite: number,
  codeProgramme: string
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      existing,
    }: {
      id: number
      data: SuiviDecaissementPtbaFormData
      existing?: Pick<
        SuiviDecaissementPtba,
        'periode_suivi_dec' | 'taux_dollars_jour' | 'programme'
      >
    }) =>
      suiviDecaissementPtbaService.update(
        id,
        idActivite,
        data,
        codeProgramme,
        existing
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}

export const useDeleteSuiviDecaissement = (idActivite: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviDecaissementPtbaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviPtbaQueryKeys.suiviDecaissement(idActivite),
      })
    },
  })
}

// Re-export payload types for forms
export type { SuiviAvancementContratPayload, SuiviAvancementWithSourcesInput }
