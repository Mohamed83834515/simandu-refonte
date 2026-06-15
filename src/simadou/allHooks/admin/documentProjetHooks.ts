import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import documentProjetService from '@/simadou/allSercices/documentProjetService'
import type { DocumentProjetApiPayload } from '@/simadou/lib/documentProjetUtils'

export const documentProjetQueryKeys = {
  all: ['documents-projets'] as const,
  byProjet: (idProjet: number) => ['documents-projets', idProjet] as const,
}

export const useGetDocumentsProjet = (idProjet?: number) =>
  useQuery({
    queryKey: documentProjetQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => documentProjetService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useCreateDocumentProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      data,
      file,
    }: {
      data: DocumentProjetApiPayload
      file: File
    }) => documentProjetService.create(data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Document ajouté avec succès')
      queryClient.invalidateQueries({
        queryKey: documentProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: documentProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'ajout du document")
      )
    },
  })
}

export const useUpdateDocumentProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: number
      data: DocumentProjetApiPayload
      file?: File
    }) => documentProjetService.update(id, data, file),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Document modifié avec succès')
      queryClient.invalidateQueries({
        queryKey: documentProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: documentProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification du document')
      )
    },
  })
}

export const useDeleteDocumentProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => documentProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Document supprimé avec succès')
      queryClient.invalidateQueries({
        queryKey: documentProjetQueryKeys.byProjet(idProjet),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression du document')
      )
    },
  })
}
