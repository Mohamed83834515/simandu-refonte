// simadou/allHooks/admin/zoneCollecteHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zoneCollecteService } from '@/simadou/allSercices/zoneCollecteService'
import { toast } from 'sonner'
import { ZoneCollecte } from '@/simadou/allTypes/zoneCollecte'

export const zoneCollecteQueryKeys = {
  all: ['zones-collecte'] as const,
  list: () => [...zoneCollecteQueryKeys.all, 'list'] as const,
}

export const useGetZonesCollecte = () => {
  return useQuery({
    queryKey: zoneCollecteQueryKeys.list(),
    queryFn: () => zoneCollecteService.getAll(),
  })
}

// simadou/allHooks/admin/zoneCollecteHooks.ts

export const useSaveZoneCollecte = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, file }: { data: ZoneCollecte; file?: File }) =>
      isEdit && currentRow?.id_zone_collecte
        ? zoneCollecteService.update(currentRow.id_zone_collecte, data, file)
        : zoneCollecteService.create(data, file),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: zoneCollecteQueryKeys.list(),
      })
      toast.success(isEdit ? 'Zone modifiée avec succès' : 'Zone créée avec succès')
      onSuccess?.()
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Une erreur est survenue')
    },
  })
}

export const useDeleteZoneCollecte = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => zoneCollecteService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: zoneCollecteQueryKeys.list(),
      })
      toast.success('Zone supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}