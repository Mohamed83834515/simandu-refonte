import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import ptbaProjetService from '@/simadou/allSercices/ptbaProjetService'
import versionPtbaService from '@/simadou/allSercices/versionPtbaService'
import type { PtbaProjetFormData } from '@/simadou/schemas/ptbaProjetSchemas'

export const ptbaProjetQueryKeys = {
  all: ['ptbas-projets'] as const,
  byProjet: (codeProjet: string) =>
    ['ptbas-projets', codeProjet] as const,
}

export const ptbasProjetsVersionQueryKeys = {
  all: ['versions-ptbas', 'ptbas-projets'] as const,
  byVersion: (idVersion: number, codeProjet?: string) =>
    [
      ...ptbasProjetsVersionQueryKeys.all,
      idVersion,
      codeProjet?.trim() || '',
    ] as const,
}

function invalidatePtbaProjetQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  codeProjet?: string
) {
  queryClient.invalidateQueries({ queryKey: ptbaProjetQueryKeys.all })
  queryClient.invalidateQueries({ queryKey: ptbasProjetsVersionQueryKeys.all })
  if (codeProjet) {
    queryClient.invalidateQueries({
      queryKey: ptbaProjetQueryKeys.byProjet(codeProjet),
    })
  }
}

/** GET /ptbas-projets/?code_projet=… (tous les PTBA du projet, toutes versions). */
export const useGetPtbasProjet = (codeProjet?: string) =>
  useQuery({
    queryKey: ptbaProjetQueryKeys.byProjet(codeProjet ?? ''),
    queryFn: () => ptbaProjetService.getByProjet(codeProjet!),
    enabled: !!codeProjet,
  })

/**
 * GET /versions-ptbas/{id}/ptbas-projets/?code_projet=…
 * Sans code_projet : tous les PTBA projets de la version (dashboard).
 * Avec code_projet : uniquement le projet courant (onglets PTBA / Suivi PTBA).
 */
export function useGetPtbasProjetsByVersion(
  versionId?: number,
  codeProjet?: string
) {
  const code = codeProjet?.trim() || undefined

  return useQuery({
    queryKey: ptbasProjetsVersionQueryKeys.byVersion(versionId ?? 0, code),
    queryFn: () => versionPtbaService.getPtbasProjets(versionId!, code),
    enabled: versionId != null && versionId > 0,
  })
}

export const useCreatePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PtbaProjetFormData) => ptbaProjetService.create(data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet créée avec succès')
      invalidatePtbaProjetQueries(queryClient, codeProjet)
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la création de l'activité PTBA projet"
        )
      )
    },
  })
}

export const useUpdatePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<PtbaProjetFormData>
    }) => ptbaProjetService.update(id, data),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet modifiée avec succès')
      invalidatePtbaProjetQueries(queryClient, codeProjet)
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la modification de l'activité PTBA projet"
        )
      )
    },
  })
}

export const useDeletePtbaProjet = (codeProjet?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ptbaProjetService.delete(id),
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => {
      toast.success('Activité PTBA projet supprimée avec succès')
      invalidatePtbaProjetQueries(queryClient, codeProjet)
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Erreur lors de la suppression de l'activité PTBA projet"
        )
      )
    },
  })
}
