import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { personnelService } from '@/simadou/allSercices/personnelService'
import type { Personnel } from '@/simadou/allTypes'
import type { PersonnelWriteData } from '@/simadou/schemas/personnelWriteSchema'

export const personnelQueryKeys = {
  all: ['personnels'] as const,
  byId: (id: number) => ['personnels', id] as const,
} as const

export function useGetPersonnels() {
  return useQuery({
    queryKey: personnelQueryKeys.all,
    queryFn: () => personnelService.getAll(),
  })
}

export function useGetPersonnel(id: number | null | undefined) {
  return useQuery({
    queryKey: personnelQueryKeys.byId(id ?? 0),
    queryFn: () => personnelService.getById(id!),
    enabled: id != null,
  })
}

export function useCreatePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PersonnelWriteData) => personnelService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.all })
    },
  })
}

export function useUpdatePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: PersonnelWriteData
    }) => personnelService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.byId(vars.id) })
    },
  })
}

export function useDeletePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personnelService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.all })
    },
  })
}

export function useEnablePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personnelService.enable(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.byId(id) })
    },
  })
}

export function useDisablePersonnel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personnelService.disable(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: personnelQueryKeys.byId(id) })
    },
  })
}

export const getPersonnels = () => personnelService.getAll()

export type { Personnel }
