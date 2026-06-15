// simadou/allfonctionalities/parametrage/zone-collecte/AddZoneCollecte.tsx
import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { zoneCollecteSchema } from '@/simadou/schemas/zoneCollecteSchema'
import { useSaveZoneCollecte } from '@/simadou/allHooks/admin/zoneCollecteHooks'
import { ZoneCollecte } from '@/simadou/allTypes/zoneCollecte'
import { getZoneCollecteFormConfig } from '@/simadou/allfieldsConfig/zoneCollecteForm'
import { useGetTypeZones } from '@/simadou/allHooks/admin/typeZoneHooks'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentRow?: ZoneCollecte | null;
}

export default function AddZoneCollecte({
    open, onOpenChange, currentRow
}: Props) {
    const isEdit = !!currentRow
    const { data: typesZone = [] } = useGetTypeZones()

    // Configuration du formulaire avec les options dynamiques
    const formConfig = useMemo(() => {
        const config = getZoneCollecteFormConfig()

        // Transformer les types de zone en options pour le select
        const typeZoneOptions = typesZone.map((type: any) => ({
            label: type.nom_type_zone,
            value: type.id_type_zone,
        }))

        // Mettre à jour les options du champ type_zone
        return {
            fields: config.fields.map((field) => {
                if (field.name === 'type_zone') {
                    return { ...field, options: typeZoneOptions }
                }
                return field
            }),
        }
    }, [typesZone])

    // Valeurs par défaut
    const defaultValues = useMemo(() => {
        const typeZone = currentRow?.type_zone
        return {
            code_zone: currentRow?.code_zone || '',
            nom_zone: currentRow?.nom_zone || '',
            shape_file: currentRow?.shape_file || '',
            type_zone: typeof typeZone === 'object' && typeZone !== null
                ? (typeZone as any).id_type_zone
                : typeZone || null,
        }
    }, [currentRow])

    const mutation = useSaveZoneCollecte(isEdit, currentRow, () => {
        onOpenChange(false)
    })

    const handleSubmit = (data: ZoneCollecte) => {
        console.log(data)
        mutation.mutate({
            data,
            file: data.shape_file || undefined
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.md}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier une zone" : "Ajouter une zone"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Modification de la zone de collecte existante"
                            : "Création d'une nouvelle zone de collecte"}
                    </DialogDescription>
                </DialogHeader>

                <DynamicForm
                    config={formConfig}
                    schema={zoneCollecteSchema}
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