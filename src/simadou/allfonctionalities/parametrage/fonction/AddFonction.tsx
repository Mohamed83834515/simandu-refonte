import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { fonctionSchema, FonctionFormData } from '@/simadou/schemas/fonctionSchema'
import { useSaveFonction } from '@/simadou/allHooks/admin/fonctionHooks'
import { Fonction } from '@/simadou/allTypes/fonction'
import { getFonctionFormConfig } from '@/simadou/allfieldsConfig/fonctionForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: Fonction | null;
}

export default function AddFonction({
    open, onOpenChange, currentRow
}: Props) {
    const isEdit = !!currentRow

    const formConfig = useMemo(() => getFonctionFormConfig(), [])

    const defaultValues = useMemo(() => ({
        nom_fonction: currentRow?.nom_fonction || '',
        description_fonction: currentRow?.description_fonction || '',
    }), [currentRow])

    const mutation = useSaveFonction(isEdit, currentRow, () => {
        onOpenChange(false)
    })

    const handleSubmit = (data: FonctionFormData) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.md}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier une fonction" : "Ajouter une fonction"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Modification de la fonction existante"
                            : "Création d'une nouvelle fonction"}
                    </DialogDescription>
                </DialogHeader>

                <DynamicForm
                    config={formConfig}
                    schema={fonctionSchema}
                    defaultValues={defaultValues}
                    onSubmit={handleSubmit}
                    isLoading={mutation.isPending}
                    submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
                    loadingText='Enregistrement...'
                />
            </DialogContent>
        </Dialog>
    )
}