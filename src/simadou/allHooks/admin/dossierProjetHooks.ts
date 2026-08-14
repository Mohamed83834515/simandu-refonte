import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import dossierProjetService from '@/simadou/allSercices/dossierProjetService'
import type { DossierProjetWritePayload } from '@/simadou/allTypes/dossierProjet'

export const dossierProjetQueryKeys = {
  all: ['dossiers-projets'] as const,
  byProjet: (idProjet: number) => ['dossiers-projets', idProjet] as const,
  detail: (idDossier: number) => ['dossiers-projets', 'detail', idDossier] as const,
}

export const useGetDossiersProjet = (idProjet?: number) =>
  useQuery({
    queryKey: dossierProjetQueryKeys.byProjet(idProjet ?? 0),
    queryFn: () => dossierProjetService.getByProjet(idProjet!),
    enabled: idProjet != null && idProjet > 0,
  })

export const useGetDossierProjet = (idDossier?: number) =>
  useQuery({
    queryKey: dossierProjetQueryKeys.detail(idDossier ?? 0),
    queryFn: () => dossierProjetService.getById(idDossier!),
    enabled: idDossier != null && idDossier > 0,
  })

export const useCreateDossierProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DossierProjetWritePayload) =>
      dossierProjetService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Dossier créé avec succès')
      queryClient.invalidateQueries({
        queryKey: dossierProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: dossierProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la création du dossier')
      )
    },
  })
}

export const useUpdateDossierProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: DossierProjetWritePayload
    }) => dossierProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Dossier modifié avec succès')
      queryClient.invalidateQueries({
        queryKey: dossierProjetQueryKeys.byProjet(idProjet),
      })
      queryClient.invalidateQueries({ queryKey: dossierProjetQueryKeys.all })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la modification du dossier')
      )
    },
  })
}

export const useDeleteDossierProjet = (idProjet: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => dossierProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Dossier supprimé avec succès')
      queryClient.invalidateQueries({
        queryKey: dossierProjetQueryKeys.byProjet(idProjet),
      })
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Erreur lors de la suppression du dossier')
      )
    },
  })
}
