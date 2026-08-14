import { useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StepDynamicForm } from '@/Global/Forms/StepDynamicForm'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useActiveProgrammeCode, useActiveProgrammeId } from '@/hooks/use-active-programme'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import { getContratPerformanceFormConfig } from '@/simadou/allfieldsConfig/contratPerformanceForm'
import { contratPerformanceSchema } from '@/simadou/schemas/contratPerformanceSchema'
import { useCreateContratPerformance, useUpdateContratPerformance } from '@/simadou/allHooks/admin/contratPerformanceHooks'
import { toast } from 'sonner'
import type { ContratPerformance, ContratPerformancePayload } from '@/simadou/allTypes/contratPerformance'
import { useMe } from '@/simadou/allHooks/auth/authHooks'
import { usePtbaVersionSelection } from '@/simadou/allHooks/admin/versionHooks'
import { UGL, VersionPtba } from '@/simadou/allTypes/entities'
import { Programme } from '@/simadou/allTypes'

interface AddContratPerformanceProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: ContratPerformance | null
}

export default function AddContratPerformance({ open, onOpenChange, currentRow }: AddContratPerformanceProps) {
    const programmeId = useActiveProgrammeId()
    const codeProgramme = useActiveProgrammeCode()
    const isEdit = !!currentRow?.id_contrat
    const { data: ugls = [] } = useGetUgls()
    const { data: user } = useMe()

    const createMutation = useCreateContratPerformance(programmeId)
    const updateMutation = useUpdateContratPerformance(currentRow?.id_contrat ?? 0, programmeId)

    const { selectedVersionId } = usePtbaVersionSelection(codeProgramme)

    const formConfig = useMemo(
        () => getContratPerformanceFormConfig(ugls),
        [ugls]
    )

    const defaultValues = {
        code_contrat: currentRow?.code_contrat ?? '',
        intitule_contrat: currentRow?.intitule_contrat ?? '',
        signataire_ministere: currentRow?.signataire_ministere ?? '',
        date_signature: currentRow?.date_signature ?? '',
        date_debut: currentRow?.date_debut ?? '',
        date_fin: currentRow?.date_fin ?? '',
        statut: currentRow?.statut ?? 'en_cours',
        note_globale: currentRow?.note_globale?.toString() ?? '0',
        appreciation: currentRow?.appreciation ?? '',
        observation_globale: currentRow?.observation_globale ?? '',
        etat: isEdit ? 'Modifier' : "Ajouter",
        version_ptba: typeof currentRow?.version_ptba === 'object' ? (currentRow.version_ptba as VersionPtba).id_version_ptba : (selectedVersionId ? Number(selectedVersionId) : 0) ?? currentRow?.version_ptba,
        structure: typeof currentRow?.structure === 'object' ? (currentRow.structure as UGL).id_ugl : currentRow?.structure ?? 0,
        id_personnel: user?.n_personnel,
        programme: typeof currentRow?.programme === 'object' ? (currentRow.programme as Programme).id_programme : (programmeId ? Number(programmeId) : 0) ?? currentRow?.programme,
    }

    const handleSubmit = (data: ContratPerformancePayload) => {
        if (!programmeId) {
            toast.error('Sélectionnez un programme avant de continuer.')
            return
        }

        const resolvedVersionId = selectedVersionId ? Number(selectedVersionId) : currentRow?.version_ptba ?? 0
        const payload: ContratPerformancePayload = {
            ...data,
            programme: programmeId,
            structure: data.structure ?? 0,
            version_ptba: resolvedVersionId,
            id_personnel: data.id_personnel ?? 0,
            note_globale: data.note_globale ?? 0,
        }

        if (isEdit && currentRow?.id_contrat) {
            updateMutation.mutate(
                { id: currentRow.id_contrat, data: payload },
                {
                    onSuccess: () => {
                        toast.success('Contrat modifié avec succès')
                        onOpenChange(false)
                    },
                    onError: () => {
                        toast.error('Erreur lors de la modification')
                    },
                }
            )
            return
        }

        createMutation.mutate(payload, {
            onSuccess: () => {
                toast.success('Contrat créé avec succès')
                onOpenChange(false)
            },
            onError: () => {
                toast.error("Erreur lors de l'enregistrement")
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.xl}>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Modifier le contrat de performance' : 'Ajouter un contrat de performance'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Mettez à jour les informations du contrat.' : 'Renseignez les informations du contrat en plusieurs étapes.'}
                    </DialogDescription>
                </DialogHeader>

                <StepDynamicForm
                    config={formConfig}
                    schema={contratPerformanceSchema}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isLoading={isEdit ? updateMutation.isPending : createMutation.isPending}
                    submitText={isEdit ? 'Modifier' : 'Créer le contrat'}
                    loadingText={isEdit ? 'Modification…' : 'Enregistrement…'}
                />
            </DialogContent>
        </Dialog>
    )
}
