import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import suiviDecaissementConventionService from '@/simadou/allSercices/suiviDecaissementConventionService'
import suiviAvancementConventionService, {
  type SuiviAvancementConventionPayload,
} from '@/simadou/allSercices/suiviAvancementConventionService'
import sourceVerificationSuiviAvancementConventionService from '@/simadou/allSercices/sourceVerificationSuiviAvancementConventionService'
import type { SuiviDecaissementConventionFormData } from '@/simadou/schemas/suiviDecaissementConventionSchemas'

export const suiviConventionQueryKeys = {
  decaissement: (idConvention: number) =>
    ['suivi-convention', 'decaissement', idConvention] as const,
  avancement: (idConvention: number) =>
    ['suivi-convention', 'avancement', idConvention] as const,
  avancementSources: (idSuivi: number) =>
    ['suivi-convention', 'avancement-sources', idSuivi] as const,
}

export const useGetSuiviDecaissementByConvention = (idConvention: number) =>
  useQuery({
    queryKey: suiviConventionQueryKeys.decaissement(idConvention),
    queryFn: () =>
      suiviDecaissementConventionService.getByConvention(idConvention),
    enabled: Number.isFinite(idConvention) && idConvention > 0,
  })

export const useCreateSuiviDecaissementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SuiviDecaissementConventionFormData) =>
      suiviDecaissementConventionService.create(idConvention, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.decaissement(idConvention),
      })
    },
  })
}

export const useUpdateSuiviDecaissementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: SuiviDecaissementConventionFormData
    }) => suiviDecaissementConventionService.update(id, idConvention, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.decaissement(idConvention),
      })
    },
  })
}

export const useDeleteSuiviDecaissementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      suiviDecaissementConventionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.decaissement(idConvention),
      })
    },
  })
}

export const useGetSuiviAvancementByConvention = (idConvention: number) =>
  useQuery({
    queryKey: suiviConventionQueryKeys.avancement(idConvention),
    queryFn: () =>
      suiviAvancementConventionService.getByConvention(idConvention),
    enabled: Number.isFinite(idConvention) && idConvention > 0,
  })

export const useGetSuiviAvancementConventionSources = (idSuivi?: number) =>
  useQuery({
    queryKey: suiviConventionQueryKeys.avancementSources(idSuivi ?? 0),
    queryFn: () =>
      sourceVerificationSuiviAvancementConventionService.getBySuivi(idSuivi!),
    enabled: Number.isFinite(idSuivi) && (idSuivi ?? 0) > 0,
  })

export const useCreateSuiviAvancementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      payload,
      fichiers,
    }: {
      payload: SuiviAvancementConventionPayload
      fichiers: File[]
    }) => {
      const created = await suiviAvancementConventionService.create(payload)
      if (fichiers.length > 0 && created.id_suivi) {
        await sourceVerificationSuiviAvancementConventionService.uploadFiles(
          created.id_suivi,
          fichiers
        )
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.avancement(idConvention),
      })
    },
  })
}

export const useUpdateSuiviAvancementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
      fichiers,
    }: {
      id: number
      payload: SuiviAvancementConventionPayload
      fichiers: File[]
    }) => {
      const updated = await suiviAvancementConventionService.update(id, payload)
      if (fichiers.length > 0) {
        await sourceVerificationSuiviAvancementConventionService.uploadFiles(
          id,
          fichiers
        )
      }
      return updated
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.avancement(idConvention),
      })
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.avancementSources(variables.id),
      })
    },
  })
}

export const useDeleteSuiviAvancementConvention = (idConvention: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suiviAvancementConventionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: suiviConventionQueryKeys.avancement(idConvention),
      })
    },
  })
}
