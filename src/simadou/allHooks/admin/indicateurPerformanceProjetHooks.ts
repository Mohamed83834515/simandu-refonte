import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  IndicateurPerformanceFormData
} from '@/simadou/schemas/indicateurPerformanceProjetSchemas'
import indicateurPerformanceProjetService from '@/simadou/allSercices/indicateurPerformanceProjetService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const indicateurPerformanceProjetQueryKeys = {
  all: ['indicateurs-performance-projet'] as const,
  byProjet: (codeProjet: string | undefined) =>
    [...indicateurPerformanceProjetQueryKeys.all, 'by-projet', codeProjet] as const,
  byActivite: (codeActivite: string | undefined) =>
    [...indicateurPerformanceProjetQueryKeys.all, 'by-activite', codeActivite] as const,
}

export function useGetAllIndicateursPerformanceProjet() {
  return useQuery({
    queryKey: [...indicateurPerformanceProjetQueryKeys.all, 'unfiltered'] as const,
    queryFn: () => indicateurPerformanceProjetService.getAll(),
  })
}

export function useGetIndicateursPerformanceProjet(codeProjet: string | undefined) {
  return useQuery({
    queryKey: indicateurPerformanceProjetQueryKeys.byProjet(codeProjet),
    queryFn: async () => {
      const all = await indicateurPerformanceProjetService.getAll()
      return all.filter((i) => {
        const cp = i.code_projet
        if (typeof cp === 'string') return cp === codeProjet
        if (cp && typeof cp === 'object' && 'code_projet' in cp) return cp.code_projet === codeProjet
        return false
      })
    },
    enabled: !!codeProjet,
  })
}

export function useCreateIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IndicateurPerformanceFormData) =>
      indicateurPerformanceProjetService.create(data),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}
export function useGetIndicateurPerformanceByActiviteProjet(codeActivite: string) {
  return useQuery({
    queryKey: indicateurPerformanceProjetQueryKeys.byActivite(codeActivite),
    queryFn: async () => {
      const response = await indicateurPerformanceProjetService.getByActiviteProjet(codeActivite)
      return response
    },
    enabled: !!codeActivite,
  })
}

export function useUpdateIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: IndicateurPerformanceFormData
    }) =>
      indicateurPerformanceProjetService.update(id, data),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurPerformanceProjet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => indicateurPerformanceProjetService.delete(id),
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurPerformanceProjetQueryKeys.all)
    },
  })
}

