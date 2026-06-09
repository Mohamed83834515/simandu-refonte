import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IndicateurCadreResultatFormData } from '@/simadou/allTypes'
import { indicateurCadreResultatService } from '@/simadou/allSercices/indicateurCadreResultatService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const indicateurCadreResultatQueryKeys = {
  all: ['indicateurs-cadre-resultat'] as const,
}

export function useGetIndicateursCadreResultat() {
  return useQuery({
    queryKey: indicateurCadreResultatQueryKeys.all,
    queryFn: () => indicateurCadreResultatService.getAll(),
  })
}

export function useCreateIndicateurCadreResultat(codeProjet: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IndicateurCadreResultatFormData) =>
      indicateurCadreResultatService.create({
        ...data,
        projet_iop: data.projet_iop ?? codeProjet,
      }),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCadreResultatQueryKeys.all)
    },
  })
}

export function useUpdateIndicateurCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<IndicateurCadreResultatFormData>
    }) => indicateurCadreResultatService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCadreResultatQueryKeys.all)
    },
  })
}

export function useDeleteIndicateurCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => indicateurCadreResultatService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, indicateurCadreResultatQueryKeys.all)
    },
  })
}
