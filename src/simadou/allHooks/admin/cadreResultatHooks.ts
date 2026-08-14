import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { cadreResultatService } from '@/simadou/allSercices/cadreResultatService'
import { niveauCadreResultatService } from '@/simadou/allSercices/niveauCadreResultatService'
import type { NiveauCadreResultat } from '@/simadou/allTypes'
import type {
  CadreResultatCreateData,
  CadreResultatUpdateData,
  NiveauCadreResultatCreateData,
} from '@/simadou/schemas/cadreResultatSchemas'

export const niveauCadreResultatQueryKeys = {
  all: ['niveaux-cadre-resultat'] as const,
}

export const cadreResultatQueryKeys = {
  all: ['cadres-resultat'] as const,
}

export function useGetNiveauxCadreResultat(idProjet: number) {
  return useQuery({
    queryKey: niveauCadreResultatQueryKeys.all,
    queryFn: () => niveauCadreResultatService.getByProjet(idProjet),
  })
}

export function useCreateNiveauCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: NiveauCadreResultatCreateData) =>
      niveauCadreResultatService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauCadreResultatQueryKeys.all)
    },
  })
}

export function useUpdateNiveauCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<NiveauCadreResultat>
    }) => niveauCadreResultatService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauCadreResultatQueryKeys.all)
    },
  })
}

export function useDeleteNiveauCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => niveauCadreResultatService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, niveauCadreResultatQueryKeys.all)
    },
  })
}

export function useGetCadresResultat(codeProjet: string) {
  return useQuery({
    queryKey: [cadreResultatQueryKeys.all, codeProjet],
    queryFn: () => cadreResultatService.getbyProjet(codeProjet),
  })
}

export function useCreateCadreResultat(codeProjet: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CadreResultatCreateData) =>
      cadreResultatService.create({
        ...data,
        projet_cr: data.projet_cr ?? codeProjet ?? null,
      }),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cadreResultatQueryKeys.all)
    },
  })
}

export function useUpdateCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CadreResultatUpdateData }) =>
      cadreResultatService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cadreResultatQueryKeys.all)
    },
  })
}

export function useDeleteCadreResultat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cadreResultatService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(queryClient, cadreResultatQueryKeys.all)
    },
  })
}
