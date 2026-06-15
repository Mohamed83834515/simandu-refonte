import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IndicateurCmrFormData } from '@/simadou/allTypes'
import type {
  IndicateurCmrProjet,
  IndicateurCmrProjetFormData,
} from '@/simadou/allTypes/indicateurCmrProjet'
import { indicateurCmrService } from '@/simadou/allSercices/indicateurCmrService'
import { indicateurCmrProjetService } from '@/simadou/allSercices/indicateurCmrProjetService'
import {
  matchesIndicateurCmrProjet,
  withIndicateurCmrProjetCode,
} from '@/simadou/lib/indicateurCmrProjetUtils'
import {
  cibleCmrService,
  type CibleCmrFormData,
} from '@/simadou/allSercices/cibleCmrService'
import {
  cibleCmrProjetService,
  type CibleCmrProjetFormData,
} from '@/simadou/allSercices/cibleCmrProjetService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const indicateurCmrQueryKeys = {
  all: ['indicateurs-cmr'] as const,
}

export const indicateurCmrProjetQueryKeys = {
  all: ['indicateurs-cmr-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...indicateurCmrProjetQueryKeys.all, 'by-projet', codeProjet] as const,
}

export const cibleCmrQueryKeys = {
  all: ['cibles-cmr'] as const,
  byIndicateur: (indicateurCmrId: number | undefined) =>
    [...cibleCmrQueryKeys.all, 'by-indicateur', indicateurCmrId] as const,
}

export const cibleCmrProjetQueryKeys = {
  all: ['cibles-cmr-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...cibleCmrProjetQueryKeys.all, 'by-projet', codeProjet] as const,
}

async function invalidateCibleCmrPolitiqueQueries(
  queryClient: ReturnType<typeof useQueryClient>
) {
  await invalidateAndRefetch(queryClient, cibleCmrQueryKeys.all)
}

async function invalidateCibleCmrQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  codeProjet?: string
) {
  await invalidateAndRefetch(queryClient, cibleCmrProjetQueryKeys.all)
  if (codeProjet) {
    await invalidateAndRefetch(
      queryClient,
      cibleCmrProjetQueryKeys.byProjet(codeProjet)
    )
  }
}

export function useGetIndicateursCmr() {
  return useQuery({
    queryKey: indicateurCmrQueryKeys.all,
    queryFn: () => indicateurCmrService.getAll(),
  })
}

export function useGetIndicateurCmr(id: number | null | undefined) {
  return useQuery({
    queryKey: [...indicateurCmrQueryKeys.all, id] as const,
    queryFn: () => indicateurCmrService.getById(id!),
    enabled: id != null,
  })
}

export const getIndicateurCmrs = async () => indicateurCmrService.getAll()

export function useCreateIndicateurCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurCmrFormData) => indicateurCmrService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCmrQueryKeys.all)
    },
  })
}

export function useUpdateIndicateurCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IndicateurCmrFormData> }) =>
      indicateurCmrService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCmrQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurCmrService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCmrQueryKeys.all)
    },
  })
}

export function useGetIndicateursCmrProjet(
  codeProjet: string | undefined,
  idProjet?: number | null
) {
  return useQuery({
    queryKey: indicateurCmrProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      if (!codeProjet) return []

      try {
        const scoped = await indicateurCmrProjetService.getByProjet(codeProjet)
        if (scoped.length > 0) return scoped
      } catch {
        // fallback client-side
      }

      const all = await indicateurCmrProjetService.getAll()
      const filtered = all.filter((indicateur) =>
        matchesIndicateurCmrProjet(indicateur, codeProjet, idProjet)
      )
      if (filtered.length > 0) return filtered

      // L'API peut renvoyer des enregistrements sans code_projet sur la liste.
      return all.filter(
        (indicateur) =>
          indicateur.code_projet == null &&
          indicateur.projet == null &&
          !(indicateur as Record<string, unknown>).projet_cmr
      )
    },
    enabled: !!codeProjet,
  })
}

export function useGetIndicateurCmrProjet(id: number | null | undefined) {
  return useQuery({
    queryKey: [...indicateurCmrProjetQueryKeys.all, id] as const,
    queryFn: () => indicateurCmrProjetService.getById(id!),
    enabled: id != null,
  })
}

export function useCreateIndicateurCmrProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurCmrProjetFormData) =>
      indicateurCmrProjetService.create({
        ...data,
        code_projet: codeProjet ?? data.code_projet ?? null,
      }),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async (created) => {
      if (codeProjet) {
        const normalized = withIndicateurCmrProjetCode(created, codeProjet)
        queryClient.setQueryData<IndicateurCmrProjet[]>(
          indicateurCmrProjetQueryKeys.byProjet(codeProjet),
          (current = []) => {
            if (
              current.some(
                (item) => item.id_ref_ind_cmr === normalized.id_ref_ind_cmr
              )
            ) {
              return current
            }
            return [...current, normalized]
          }
        )
      }

      await invalidateAndRefetch(queryClient, indicateurCmrProjetQueryKeys.all)
      if (codeProjet) {
        await invalidateAndRefetch(
          queryClient,
          indicateurCmrProjetQueryKeys.byProjet(codeProjet)
        )
      }
    },
  })
}

export function useUpdateIndicateurCmrProjet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurCmrProjetFormData>
    }) => indicateurCmrProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCmrProjetQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurCmrProjet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurCmrProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCmrProjetQueryKeys.all)
    },
  })
}

export function useGetAllCiblesCmr() {
  return useQuery({
    queryKey: cibleCmrQueryKeys.all,
    queryFn: () => cibleCmrService.getAll(),
  })
}

export function useGetCiblesCmrByIndicateur(
  indicateurCmrId: number | null | undefined
) {
  return useQuery({
    queryKey: cibleCmrQueryKeys.byIndicateur(indicateurCmrId ?? undefined),
    queryFn: async () => {
      const list = await cibleCmrService.getAll()
      return list
    },
    enabled: indicateurCmrId != null,
  })
}

export function useCreateCibleCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CibleCmrFormData) => cibleCmrService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrPolitiqueQueries(queryClient)
    },
  })
}

export function useUpdateCibleCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CibleCmrFormData }) =>
      cibleCmrService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrPolitiqueQueries(queryClient)
    },
  })
}

export function useDeleteCibleCmr() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cibleCmrService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrPolitiqueQueries(queryClient)
    },
  })
}

export function useGetAllCiblesCmrProjet() {
  return useQuery({
    queryKey: cibleCmrProjetQueryKeys.all,
    queryFn: () => cibleCmrProjetService.getAll(),
  })
}

export function useCreateCibleCmrProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CibleCmrProjetFormData) =>
      cibleCmrProjetService.create({
        ...data,
        code_projet: codeProjet ?? data.code_projet ?? null,
      }),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrQueries(queryClient, codeProjet)
    },
  })
}

export function useUpdateCibleCmrProjet(codeProjet: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CibleCmrProjetFormData
    }) => cibleCmrProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrQueries(queryClient, codeProjet)
    },
  })
}

export function useDeleteCibleCmrProjet(codeProjet?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cibleCmrProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateCibleCmrQueries(queryClient, codeProjet)
    },
  })
}