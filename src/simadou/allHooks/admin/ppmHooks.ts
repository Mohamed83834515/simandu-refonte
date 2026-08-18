import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { ppmService } from '@/simadou/allSercices/ppmService'
import type { PpmFormData } from '@/simadou/schemas/ppmSchema'

export const ppmQueryKeys = {
  all: ['ppms'] as const,
  list: () => [...ppmQueryKeys.all, 'list'] as const,
}

export const useGetPpms = () =>
  useQuery({
    queryKey: ppmQueryKeys.list(),
    queryFn: () => ppmService.getAll(),
  })

export const useSavePpm = (
  isEdit: boolean,
  currentRow?: { id_ppm?: number } | null,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PpmFormData) =>
      isEdit && currentRow?.id_ppm
        ? ppmService.update(currentRow.id_ppm, data)
        : ppmService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ppmQueryKeys.list(),
      })
      toast.success(
        isEdit ? 'Marché modifié avec succès' : 'Marché créé avec succès'
      )
      onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la sauvegarde du marché'))
    },
  })
}

export const useDeletePpm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ppmService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ppmQueryKeys.list(),
      })
      toast.success('Marché supprimé avec succès')
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Erreur lors de la suppression du PPM'))
    },
  })
}

export const useImportPpm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      versionPpm,
    }: {
      file: File
      versionPpm?: number
    }) => ppmService.importFromExcel(file, versionPpm),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ppmQueryKeys.list(),
      })
      toast.success('Marché importé avec succès')
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'import du Marché")
      )
    },
  })
}
