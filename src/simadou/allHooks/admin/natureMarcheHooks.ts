import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { natureMarcheService } from '@/simadou/allSercices/natureMarcheService'
import type { NatureMarcheFormData } from '@/simadou/schemas/natureMarcheSchema'

export const natureMarcheQueryKeys = {
  all: ['natures-marche'] as const,
  list: () => [...natureMarcheQueryKeys.all, 'list'] as const,
}

export const useGetNaturesMarche = () =>
  useQuery({
    queryKey: natureMarcheQueryKeys.list(),
    queryFn: () => natureMarcheService.getAll(),
  })

export const useSaveNatureMarche = (
  isEdit: boolean,
  currentRow?: { id_nature_marche?: number } | null,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NatureMarcheFormData) =>
      isEdit && currentRow?.id_nature_marche
        ? natureMarcheService.update(currentRow.id_nature_marche, data)
        : natureMarcheService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: natureMarcheQueryKeys.list(),
      })
      toast.success(
        isEdit ? 'Nature de marché modifiée avec succès' : 'Nature de marché créée avec succès'
      )
      onSuccess?.()
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde de la nature de marché')
    },
  })
}

export const useDeleteNatureMarche = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => natureMarcheService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: natureMarcheQueryKeys.list(),
      })
      toast.success('Nature de marché supprimée avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la nature de marché')
    },
  })
}
