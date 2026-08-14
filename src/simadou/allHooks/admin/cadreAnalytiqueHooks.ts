import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { cadreAnalytiqueService } from '@/simadou/allSercices/cadreAnalytiqueService'
import {
  niveauCadreAnalytiqueService,
  type NiveauCadreAnalytiqueFormData,
} from '@/simadou/allSercices/niveauCadreAnalytiqueService'
import type { CadreAnalytique } from '@/simadou/allTypes/cadreAnalytique'
import type {
  CadreAnalytiqueWriteData,
  NiveauCadreAnalytiqueWriteData,
} from '@/simadou/schemas/cadreAnalytiqueSchemas'
import {
  useActiveProgrammeCode,
  useActiveProgrammeId,
} from '@/hooks/use-active-programme'

export const niveauCadreAnalytiqueQueryKeys = {
  all: ['niveaux-cadre-analytique'] as const,
} as const

export const cadreAnalytiqueQueryKeys = {
  all: ['cadres-analytiques'] as const,
  byProgramme: (programmeId: number) =>
    ['cadres-analytiques', programmeId] as const,
} as const

export function useGetNiveauxCadreAnalytique() {
  const codeProgramme = useActiveProgrammeCode()
  return useQuery({
    queryKey: [niveauCadreAnalytiqueQueryKeys.all, codeProgramme],
    queryFn: () => niveauCadreAnalytiqueService.getAll(codeProgramme),
  })
}

export function useCreateNiveauCadreAnalytique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauCadreAnalytiqueWriteData) =>
      niveauCadreAnalytiqueService.create(
        data as NiveauCadreAnalytiqueFormData
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreAnalytiqueQueryKeys.all
      )
    },
  })
}

export function useUpdateNiveauCadreAnalytique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: NiveauCadreAnalytiqueWriteData
    }) =>
      niveauCadreAnalytiqueService.update(
        id,
        data as NiveauCadreAnalytiqueFormData
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreAnalytiqueQueryKeys.all
      )
    },
  })
}

export function useDeleteNiveauCadreAnalytique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauCadreAnalytiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreAnalytiqueQueryKeys.all
      )
    },
  })
}

export function useGetCadresAnalytique() {
  const programmeId = useActiveProgrammeId()
  return useQuery({
    queryKey: cadreAnalytiqueQueryKeys.byProgramme(programmeId ?? 0),
    queryFn: () => cadreAnalytiqueService.getAll(programmeId),
    enabled: programmeId != null && programmeId > 0,
  })
}

export function useCreateCadreAnalytique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CadreAnalytiqueWriteData) =>
      cadreAnalytiqueService.create(data as CadreAnalytique),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async (_, variables) => {
      if (variables.programme_ca) {
        await invalidateAndRefetch(
          queryClient,
          cadreAnalytiqueQueryKeys.byProgramme(variables.programme_ca)
        )
      }
    },
  })
}

export function useUpdateCadreAnalytique(programmeId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CadreAnalytique) => cadreAnalytiqueService.update(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      if (programmeId) {
        await invalidateAndRefetch(
          queryClient,
          cadreAnalytiqueQueryKeys.byProgramme(programmeId)
        )
      }
    },
  })
}

export function useDeleteCadreAnalytique() {
  const programmeId = useActiveProgrammeId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cadreAnalytiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      if (programmeId) {
        await invalidateAndRefetch(
          queryClient,
          cadreAnalytiqueQueryKeys.byProgramme(programmeId)
        )
      }
    },
  })
}

/** Liste globale (ex. options PTBA) — sans filtre programme. */
export function useGetCadreAnalytique() {
  return useQuery({
    queryKey: cadreAnalytiqueQueryKeys.all,
    queryFn: () => cadreAnalytiqueService.getAll(),
  })
}

export const getCadreAnalytique = () => cadreAnalytiqueService.getAll()
