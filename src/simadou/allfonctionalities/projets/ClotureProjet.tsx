import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useMemo } from 'react'
import { useClotureProjet } from '@/simadou/allHooks/admin/projetHooks'
import { projetClotureSchema, type ProjetClotureFormData } from '@/simadou/schemas/projetSchema'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { toast } from 'sonner'
import { getProjetClotureFormConfig } from '@/simadou/allfieldsConfig/projetClotureForm'

interface ClotureProjetDialogProps {
    currentRow?: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ClotureProjetDialog({
    open,
    onOpenChange,
    currentRow
}: ClotureProjetDialogProps) {
    const idProjet = currentRow?.id_projet

    const formConfig = useMemo(
        () => getProjetClotureFormConfig(),
        []
    )

    // ── Mutation ──
    const clotureMutation = useClotureProjet()

    // ── Valeurs par défaut ──
    const defaultValues: ProjetClotureFormData = {
        date_cloture_projet: currentRow?.date_cloture_projet ?? '',
        is_cloture: currentRow?.is_cloture ?? false,
    }

    const handleSubmit = (data: ProjetClotureFormData) => {
        if (!idProjet) {
            toast.error('ID du projet manquant')
            return
        }

        // Si is_cloture est false, on envoie une date vide
        const submitData: ProjetClotureFormData = {
            ...data,
            date_cloture_projet: data.is_cloture ? data.date_cloture_projet : '',
        }

        clotureMutation.mutate(
            { id: idProjet, data: submitData },
            {
                onSuccess: () => {
                    onOpenChange(false)
                },
            }
        )
    }

    const title = 'Clôturer le projet'
    const description = 'Clôturer le projet pour arrêter son suivi.'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.md}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <DynamicForm
                    config={formConfig}
                    schema={projetClotureSchema}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isLoading={clotureMutation.isPending}
                    submitText={'Clôturer'}
                    loadingText={'Clôturation…'}
                />
            </DialogContent>
        </Dialog>
    )
}