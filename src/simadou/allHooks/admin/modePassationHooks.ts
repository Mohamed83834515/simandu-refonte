import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { modePassationService } from '@/simadou/allSercices/modePassationService'
import type { ModePassationFormData } from '@/simadou/schemas/modePassationSchema'

export const modePassationQueryKeys = {
  all: ['modes-passation'] as const,
  list: () => [...modePassationQueryKeys.all, 'list'] as const,
}

export const useGetModesPassation = () =>
  useQuery({
    queryKey: modePassationQueryKeys.list(),
    queryFn: () => modePassationService.getAll(),
  })

export const useSaveModePassation = (
  isEdit: boolean,
  currentRow?: { id_mode_passation?: number } | null,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ModePassationFormData) =>
      isEdit && currentRow?.id_mode_passation
        ? modePassationService.update(currentRow.id_mode_passation, data)
        : modePassationService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: modePassationQueryKeys.list(),
      })
      toast.success(
        isEdit ? 'Mode de passation modifié avec succès' : 'Mode de passation créé avec succès'
      )
      onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la sauvegarde du mode de passation'))
    },
  })
}

export const useDeleteModePassation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => modePassationService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: modePassationQueryKeys.list(),
      })
      toast.success('Mode de passation supprimé avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression du mode de passation'))
    },
  })
}
