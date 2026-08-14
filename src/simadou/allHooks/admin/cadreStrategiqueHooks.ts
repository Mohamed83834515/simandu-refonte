import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { cadreStrategiqueService } from '@/simadou/allSercices/cadreStrategiqueService'
import {
  niveauCadreStrategiqueService,
  type NiveauCadreStrategiqueFormData,
} from '@/simadou/allSercices/niveauCadreStrategiqueService'
import type { CadreStrategique } from '@/simadou/allTypes/cadreStrategique'
import type {
  CadreStrategiqueWriteData,
  NiveauCadreStrategiqueWriteData,
} from '@/simadou/schemas/cadreStrategiqueSchemas'
import { useActiveProgrammeCode, useActiveProgrammeId } from '@/hooks/use-active-programme'

export const niveauCadreStrategiqueQueryKeys = {
  all: ['niveaux-cadre-strategique'] as const,
} as const

export const cadreStrategiqueQueryKeys = {
  all: ['cadres-strategiques'] as const,
  byProgramme: (programmeId: number) =>
    ['cadres-strategiques', programmeId] as const,
} as const

export function useGetNiveauxCadreStrategique() {
  const activeProgrammeCode = useActiveProgrammeCode()
  return useQuery({
    queryKey: [niveauCadreStrategiqueQueryKeys.all, activeProgrammeCode],
    queryFn: () => niveauCadreStrategiqueService.getAll(activeProgrammeCode),
  })
}

export function useCreateNiveauCadreStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauCadreStrategiqueWriteData) =>
      niveauCadreStrategiqueService.create(
        data as NiveauCadreStrategiqueFormData
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreStrategiqueQueryKeys.all
      )
    },
  })
}

export function useUpdateNiveauCadreStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: NiveauCadreStrategiqueWriteData
    }) =>
      niveauCadreStrategiqueService.update(
        id,
        data as NiveauCadreStrategiqueFormData
      ),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreStrategiqueQueryKeys.all
      )
    },
  })
}

export function useDeleteNiveauCadreStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauCadreStrategiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauCadreStrategiqueQueryKeys.all
      )
    },
  })
}

export function useGetCadresStrategique() {
  const programmeId = useActiveProgrammeId()
  return useQuery({
    queryKey: cadreStrategiqueQueryKeys.byProgramme(programmeId ?? 0),
    queryFn: () => cadreStrategiqueService.getAll(programmeId),
    enabled: programmeId != null && programmeId > 0,
  })
}

export function useCreateCadreStrategique() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CadreStrategiqueWriteData) =>
      cadreStrategiqueService.create(data as CadreStrategique),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async (_, variables) => {
      if (variables.programme_cs) {
        await invalidateAndRefetch(
          queryClient,
          cadreStrategiqueQueryKeys.byProgramme(variables.programme_cs)
        )
      }
    },
  })
}

export function useUpdateCadreStrategique(programmeId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CadreStrategiqueWriteData
    }) => cadreStrategiqueService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      if (programmeId) {
        await invalidateAndRefetch(
          queryClient,
          cadreStrategiqueQueryKeys.byProgramme(programmeId)
        )
      }
    },
  })
}

export function useDeleteCadreStrategique(programmeId: number | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cadreStrategiqueService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      if (programmeId) {
        await invalidateAndRefetch(
          queryClient,
          cadreStrategiqueQueryKeys.byProgramme(programmeId)
        )
      }
    },
  })
}

/** Liste globale (ex. options formulaires). */
export function useGetCadreStrategiques() {
  return useQuery({
    queryKey: cadreStrategiqueQueryKeys.all,
    queryFn: () => cadreStrategiqueService.getAll(),
  })
}

export const getCadreStrategiques = () => cadreStrategiqueService.getAll()
