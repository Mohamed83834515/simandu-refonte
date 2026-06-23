// simadou/allHooks/admin/categorieActeurHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { TypeProjetService } from '@/simadou/allSercices/typeProjetService'
import { TypeProjetFormData } from '@/simadou/schemas/typeProjetSchema'

export const typeProjetQueryKeys = {
  all: ['types-projets'] as const,
  list: () => [...typeProjetQueryKeys.all, 'list'] as const,
  countProjectsPerType: () => [...typeProjetQueryKeys.all, 'countProjectsPerType'] as const,
}

export const useGetTypeProjet = () => {
  return useQuery({
    queryKey: typeProjetQueryKeys.list(),
    queryFn: () => TypeProjetService.getAll(),
  })
}

export const useCountProjectsPerType = () => {
  return useQuery({
    queryKey: typeProjetQueryKeys.countProjectsPerType(),
    queryFn: () => TypeProjetService.countProjectsPerType(),
  })
}

export const useSaveTypeProjet= (isEdit: boolean, currentRow?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TypeProjetFormData) =>
      isEdit && currentRow?.id_categorie
        ? TypeProjetService.update(currentRow?.id_type_projet, data)
        : TypeProjetService.create(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: typeProjetQueryKeys.list(),
      })
      toast.success(isEdit ? 'Type projet modifiée avec succès' : 'Type projet créée avec succès')
      onSuccess?.()
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Une erreur est survenue')
    },
  })
}

export const useDeleteTypeProjet= () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => TypeProjetService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: typeProjetQueryKeys.list(),
      })
      toast.success('Type projet supprimée avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}