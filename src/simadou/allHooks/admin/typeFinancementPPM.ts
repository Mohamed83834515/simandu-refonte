import { typeFinancementPPMService } from '@/simadou/allSercices/typeFinancementService'
import { TypeFinancementPPMFormData } from '@/simadou/schemas/typeFinancementPPM'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const TypeFinancementPPMQueryKeys = {
  all: ['types-financement-ppm'] as const,
  list: () => [...TypeFinancementPPMQueryKeys.all, 'list'] as const,
}

export const useGetTypeFinancementPPM = () =>
  useQuery({
    queryKey: TypeFinancementPPMQueryKeys.list(),
    queryFn: () => typeFinancementPPMService.getAll(),
  })

export const useSaveTypeFinancementPPM = (
  isEdit: boolean,
  currentRow?: { id_type_financement_ppm?: number } | null,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TypeFinancementPPMFormData) =>
      isEdit && currentRow?.id_type_financement_ppm
        ? typeFinancementPPMService.update(currentRow.id_type_financement_ppm, data)
        : typeFinancementPPMService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TypeFinancementPPMQueryKeys.list(),
      })
      toast.success(
        isEdit ? 'type de financement de Passation des Marches modifié avec succès' : 'type de financement de Passation des Marches créé avec succès'
      )
      onSuccess?.()
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde du type de financement de Passation des Marches')
    },
  })
}

export const useDeleteTypeFinancementPPM = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => typeFinancementPPMService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: TypeFinancementPPMQueryKeys.list(),
      })
      toast.success('type de financement de Passation des Marches supprimé avec succès')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du type de financement de Passation des Marches')
    },
  })
}
