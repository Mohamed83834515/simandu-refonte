// simadou/allfonctionalities/ugl/UglForm.tsx
import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { uglSchema, UGLFormData } from '@/simadou/schemas/uglSchema'
import { useSaveUgl } from '@/simadou/allHooks/admin/uglHooks'
import { UGL } from '@/simadou/allTypes/ugl'
import { useGetLocalites } from '@/simadou/allHooks/admin/localiteHooks'
import { getUGLFormConfig } from '@/simadou/allfieldsConfig/uglForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: UGL | null;
}

export default function AddUgl({
    open, onOpenChange, currentRow
}: Props) {
    const isEdit = !!currentRow
    const { data: localites = [] } = useGetLocalites()

    // Configuration du formulaire avec les options dynamiques
    const formConfig = useMemo(() => {
        const config = getUGLFormConfig()

        // Transformer les localités en options pour les selects
        const localiteOptions = localites.map((loc: any) => ({
            label: loc.intitule_loca,
            value: loc.id_loca,
        }))

        // Mettre à jour les options des champs select
        return {
            fields: config.fields.map((field) => {
                if (field.name === 'chef_lieu_ugl') {
                    return { ...field, options: localiteOptions }
                }
                if (field.name === 'region_concerne_ugl') {
                    return { ...field, options: localiteOptions }
                }
                return field
            }),
        }
    }, [localites])

    // Valeurs par défaut
    const defaultValues = useMemo(() => {
        const chefLieu = currentRow?.chef_lieu_ugl
        const regions = currentRow?.region_concerne_ugl

        return {
            code_ugl: currentRow?.code_ugl || '',
            nom_ugl: currentRow?.nom_ugl || '',
            abrege_ugl: currentRow?.abrege_ugl || '',
            couleur_ugl: currentRow?.couleur_ugl || '#000000',
            chef_lieu_ugl: typeof chefLieu === 'object' && chefLieu !== null
                ? (chefLieu as any).id_loca
                : chefLieu || null,
            region_concerne_ugl: Array.isArray(regions)
                ? regions.map((r: any) => (typeof r === 'object' ? r.id_loca : r))
                : [],
        }
    }, [currentRow])

    const mutation = useSaveUgl(isEdit, currentRow, () => {
        onOpenChange(false)
    })

    const handleSubmit = (data: UGLFormData) => {
        mutation.mutate(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.lg}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier une unité de gestion" : "Ajouter une unité de gestion"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Modification de l'unité de gestion"
                            : "Création d'une unité de gestion"}
                    </DialogDescription>
                </DialogHeader>

                <DynamicForm
                    config={formConfig}
                    schema={uglSchema}
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