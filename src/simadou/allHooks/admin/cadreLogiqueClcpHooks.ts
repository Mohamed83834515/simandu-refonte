import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { cadreLogiqueClcpService } from '@/simadou/allSercices/cadreLogiqueClcpService'
import { niveauConfigClcpService } from '@/simadou/allSercices/niveauConfigClcpService'
import type { CadreLogiqueClcpPayload } from '@/simadou/allTypes/cadreLogiqueClcp'
import type { NiveauConfigClcpPayload } from '@/simadou/allTypes/niveauConfigClcp'
import type {
  CadreLogiqueClcpCreateData,
  CadreLogiqueClcpUpdateData,
} from '@/simadou/schemas/cadreLogiqueClcpSchemas'

export const niveauConfigClcpQueryKeys = {
  byContrat: (idContrat: number) =>
    ['niveaux-config-clcp', idContrat] as const,
}

export const cadreLogiqueClcpQueryKeys = {
  byContrat: (idContrat: number) =>
    ['cadres-logiques-clcp', idContrat] as const,
}

export function useGetNiveauxConfigClcp(idContrat: number) {
  return useQuery({
    queryKey: niveauConfigClcpQueryKeys.byContrat(idContrat),
    queryFn: () => niveauConfigClcpService.getByContrat(idContrat),
    enabled: Number.isFinite(idContrat) && idContrat > 0,
  })
}

export function useCreateNiveauConfigClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauConfigClcpPayload) =>
      niveauConfigClcpService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauConfigClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

export function useUpdateNiveauConfigClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<NiveauConfigClcpPayload>
    }) => niveauConfigClcpService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauConfigClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

export function useDeleteNiveauConfigClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauConfigClcpService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        niveauConfigClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

export function useGetCadresLogiquesClcp(idContrat: number) {
  return useQuery({
    queryKey: cadreLogiqueClcpQueryKeys.byContrat(idContrat),
    queryFn: () => cadreLogiqueClcpService.getByContrat(idContrat),
    enabled: Number.isFinite(idContrat) && idContrat > 0,
  })
}

export function useCreateCadreLogiqueClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CadreLogiqueClcpPayload) =>
      cadreLogiqueClcpService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cadreLogiqueClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

export function useUpdateCadreLogiqueClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: CadreLogiqueClcpUpdateData
    }) => cadreLogiqueClcpService.update(id, data as Partial<CadreLogiqueClcpPayload>),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cadreLogiqueClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

export function useDeleteCadreLogiqueClcp(idContrat: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cadreLogiqueClcpService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        cadreLogiqueClcpQueryKeys.byContrat(idContrat)
      )
    },
  })
}

// Re-export form data types for convenience
export type { CadreLogiqueClcpCreateData, CadreLogiqueClcpUpdateData }
