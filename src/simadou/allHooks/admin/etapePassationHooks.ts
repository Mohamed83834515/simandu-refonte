import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { groupeEtapePassationService } from '@/simadou/allTypes/groupeEtapePassationService'
import { EtapePassationPayload, etapePassationService } from '@/simadou/allSercices/etapePassationService'
import { sourceVerificationEtapePassationService } from '@/simadou/allTypes/sourceVerificationEtapePassationService'

export const etapePassationQueryKeys = {
    all: ['etapes-passation'] as const,
    byPpm: (idPpm: number) =>
        [...etapePassationQueryKeys.all, 'ppm', idPpm] as const,
}

export const groupeEtapePassationQueryKeys = {
    all: ['groupes-etapes-passation'] as const,
    list: () => [...groupeEtapePassationQueryKeys.all, 'list'] as const,
}

export const sourceVerificationEtapeQueryKeys = {
    all: ['sources-verification-etapes-passation'] as const,
    byEtape: (idEtape: number) =>
        [...sourceVerificationEtapeQueryKeys.all, 'etape', idEtape] as const,
}

// ── Groupes d'étapes (lecture seule pour le select) ──────────────────────
export const useGetGroupesEtapesPassation = () =>
    useQuery({
        queryKey: groupeEtapePassationQueryKeys.list(),
        queryFn: () => groupeEtapePassationService.getAll(),
    })

// ── Étapes ─────────────────────────────────────────────────────────────
export const useGetEtapesByPpm = (idPpm: number) =>
    useQuery({
        queryKey: etapePassationQueryKeys.byPpm(idPpm ?? 0),
        queryFn: async () => {
            const all = await etapePassationService.getAllByPpm(idPpm)
            return all
        },
        enabled: idPpm != null,
    })

export const useSaveEtapePassation = (
    idPpm: number,
    onSuccess?: () => void
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id?: number
            data: EtapePassationPayload
        }) =>
            id
                ? etapePassationService.update(id, data)
                : etapePassationService.create(data),
        meta: { suppressGlobalErrorToast: true },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: etapePassationQueryKeys.byPpm(idPpm),
            })
            toast.success('Étape enregistrée')
            onSuccess?.()
        },
        onError: (error) =>
            toast.error(
                getApiErrorMessage(error, "Erreur lors de l'enregistrement de l'étape")
            ),
    })
}

export const useDeleteEtapePassation = (idPpm: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => etapePassationService.delete(id),
        meta: { suppressGlobalErrorToast: true },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: etapePassationQueryKeys.byPpm(idPpm),
            })
            toast.success('Étape supprimée')
        },
        onError: () =>
            toast.error("Erreur lors de la suppression de l'étape"),
    })
}

// ── Fichiers (sources de vérification) ───────────────────────────────
export const useGetSourcesByEtape = (idEtape: number | undefined) =>
    useQuery({
        queryKey: sourceVerificationEtapeQueryKeys.byEtape(idEtape ?? 0),
        queryFn: () =>
            sourceVerificationEtapePassationService.getAll({
                etape_passation: idEtape,
            }),
        enabled: idEtape != null,
    })

export const useAddSourceVerificationEtape = (idEtape: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (file: File) =>
            sourceVerificationEtapePassationService.create({
                fichier_join: file,
                etape_passation: idEtape,
            }),
        meta: { suppressGlobalErrorToast: true },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: sourceVerificationEtapeQueryKeys.byEtape(idEtape),
            })
            toast.success('Fichier ajouté')
        },
        onError: (error) =>
            toast.error(getApiErrorMessage(error, "Erreur lors de l'ajout du fichier")),
    })
}

export const useDeleteSourceVerificationEtape = (idEtape: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) =>
            sourceVerificationEtapePassationService.delete(id),
        meta: { suppressGlobalErrorToast: true },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: sourceVerificationEtapeQueryKeys.byEtape(idEtape),
            })
            toast.success('Fichier supprimé')
        },
        onError: () => toast.error('Erreur lors de la suppression du fichier'),
    })
}

export const useCreateEtapePassationWithSources = (
    idPpm: number,
    onSuccess?: () => void
) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            data,
            files,
        }: {
            data: EtapePassationPayload
            files: File[]
        }) => etapePassationService.createWithSources(data, files),
        meta: { suppressGlobalErrorToast: true },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: etapePassationQueryKeys.byPpm(idPpm),
            })
            toast.success('Étape créée')
            onSuccess?.()
        },
        onError: (error) =>
            toast.error(
                getApiErrorMessage(error, "Erreur lors de la création de l'étape")
            ),
    })
}