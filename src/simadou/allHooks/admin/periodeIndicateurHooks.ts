import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PeriodeIndicateurWritePayload } from '@/simadou/allTypes/periodeIndicateur'
import { periodeIndicateurService } from '@/simadou/allSercices/periodeIndicateurService'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'

export const periodeIndicateurQueryKeys = {
  all: ['periodes-indicateurs'] as const,
  byIndicateur: (refIndicateur: number | undefined) =>
    [...periodeIndicateurQueryKeys.all, 'by-indicateur', refIndicateur] as const,
}

export function useGetPeriodesIndicateur(refIndicateur: number | null | undefined) {
  return useQuery({
    queryKey: periodeIndicateurQueryKeys.byIndicateur(refIndicateur ?? undefined),
    queryFn: () => periodeIndicateurService.getByIndicateur(refIndicateur!),
    enabled: refIndicateur != null && Number.isFinite(refIndicateur),
    meta: { suppressGlobalErrorToast: true },
  })
}

export function useCreatePeriodeIndicateur(refIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PeriodeIndicateurWritePayload) =>
      periodeIndicateurService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeIndicateurQueryKeys.byIndicateur(refIndicateur)
      )
    },
  })
}

export function useUpdatePeriodeIndicateur(refIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: PeriodeIndicateurWritePayload
    }) => periodeIndicateurService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeIndicateurQueryKeys.byIndicateur(refIndicateur)
      )
    },
  })
}

export function useDeletePeriodeIndicateur(refIndicateur: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => periodeIndicateurService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await invalidateAndRefetch(
        queryClient,
        periodeIndicateurQueryKeys.byIndicateur(refIndicateur)
      )
    },
  })
}
