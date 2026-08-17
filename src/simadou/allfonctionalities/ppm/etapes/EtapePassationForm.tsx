import { useMemo } from 'react'
import { toast } from 'sonner'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { getEtapePassationFormConfig } from '@/simadou/allfieldsConfig/etapePassationForm'
import {
    etapePassationSchema,
    type EtapePassationFormData,
} from '@/simadou/schemas/etapePassationSchemas'
import type { EtapePassation } from '@/simadou/allTypes/etapePassation'
import {
    useGetGroupesEtapesPassation,
    useSaveEtapePassation,
} from '@/simadou/allHooks/admin/etapePassationHooks'
import { resolveRelationId } from '@/simadou/lib/resolveApiRelation'

type EtapePassationFormProps = {
    etape?: EtapePassation
    idPpm: number
    onClose: () => void
    onSuccess: () => void
}

function asDateInput(value: unknown): string {
    if (value == null || value === '') return ''
    const raw = String(value).trim()
    return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : ''
}

export default function EtapePassationForm({
    etape,
    idPpm,
    onClose,
    onSuccess,
}: EtapePassationFormProps) {
    const isEditing = !!etape
    const { data: groupes = [] } = useGetGroupesEtapesPassation()

    const groupeOptions = useMemo(
        () =>
            groupes.map((g) => ({
                value: String(g.id_groupe_etape),
                label:
                    g.intitule_groupe_etape ||
                    g.code_groupe_etape ||
                    String(g.id_groupe_etape),
            })),
        [groupes]
    )

    const formConfig = useMemo(
        () => getEtapePassationFormConfig(groupeOptions),
        [groupeOptions]
    )

    const defaultValues = useMemo<EtapePassationFormData>(() => {
        const groupeId = resolveRelationId(
            etape?.groupe_etape,
            'id_groupe_etape'
        )
        return {
            etape: etape?.etape ?? '',
            date_prevu: asDateInput(etape?.date_prevu),
            groupe_etape: groupeId != null ? String(groupeId) : '',
        }
    }, [etape])

    const saveMutation = useSaveEtapePassation(idPpm, onSuccess)

    const onSubmit = (data: EtapePassationFormData) => {
        saveMutation.mutate(
            {
                id: etape?.id_etape,
                data: {
                    etape: data.etape,
                    date_prevu: data.date_prevu || null,
                    groupe_etape: data.groupe_etape ? Number(data.groupe_etape) : null,
                    ppm: idPpm,
                },
            },
            {
                onError: (error) =>
                    toast.error(
                        getApiErrorMessage(
                            error,
                            isEditing
                                ? "Erreur lors de la mise à jour de l'étape"
                                : "Erreur lors de la création de l'étape"
                        )
                    ),
            }
        )
    }

    return (
        <DynamicForm
            className='w-full'
            embedded
            config={formConfig}
            schema={etapePassationSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitText={isEditing ? 'Mettre à jour' : 'Enregistrer'}
            loadingText='Enregistrement…'
            isLoading={saveMutation.isPending}
            onCancel={onClose}
            cancelText='Retour'
        />
    )
}