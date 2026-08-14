import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import documentProjetService from '@/simadou/allSercices/documentProjetService'
import type { DocumentProjetApiPayload } from '@/simadou/lib/documentProjetUtils'

export const documentProjetQueryKeys = {
  all: ['documents-projets'] as const,
  byDossier: (idDossier: number) =>
    ['documents-projets', 'dossier', idDossier] as const,
}

export const useGetDocumentsDossier = (idDossier?: number) =>
  useQuery({
    queryKey: documentProjetQueryKeys.byDossier(idDossier ?? 0),
    queryFn: () => documentProjetService.getByDossier(idDossier!),
    enabled: idDossier != null && idDossier > 0,
  })

export const useCreateDocumentProjet = (idDossier: number) => {
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
        queryKey: documentProjetQueryKeys.byDossier(idDossier),
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

export const useUpdateDocumentProjet = (idDossier: number) => {
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
        queryKey: documentProjetQueryKeys.byDossier(idDossier),
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

export const useDeleteDocumentProjet = (idDossier: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => documentProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Document supprimé avec succès')
      queryClient.invalidateQueries({
        queryKey: documentProjetQueryKeys.byDossier(idDossier),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression du document')
      )
    },
  })
}
