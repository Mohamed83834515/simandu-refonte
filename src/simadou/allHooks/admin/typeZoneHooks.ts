// simadou/allHooks/admin/typeZoneHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { typeZoneService } from '@/simadou/allSercices/typeZoneService'
import { TypeZoneFormData } from '@/simadou/schemas/typeZoneSchema'
import { toast } from 'sonner'

export const typeZoneQueryKeys = {
  all: ['type-zone'] as const,
  list: () => [...typeZoneQueryKeys.all, 'list'] as const,
}

export const useGetTypeZones = () => {
  return useQuery({
    queryKey: typeZoneQueryKeys.list(),
    queryFn: () => typeZoneService.getAll(),
  })
}

export const useSaveTypeZone = (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TypeZoneFormData) =>
      isEdit && currentRow?.id_type_zone
        ? typeZoneService.update(currentRow.id_type_zone, data)
        : typeZoneService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: typeZoneQueryKeys.list(),
      })
      toast.success(isEdit ? 'Type de zone modifié' : 'Type de zone créé')
      onSuccess?.()
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Une erreur est survenue')
    },
  })
}

export const useDeleteTypeZone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => typeZoneService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: typeZoneQueryKeys.list(),
      })
      toast.success('Type de zone supprimé')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}