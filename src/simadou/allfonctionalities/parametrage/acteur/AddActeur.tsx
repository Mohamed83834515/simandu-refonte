// simadou/allfonctionalities/parametrage/acteur/AddActeur.tsx
import { useMemo } from 'react'
import { DynamicForm } from '@/Global/Forms/DynamicForm'
import { useSaveActeur } from '@/simadou/allHooks/admin/acteurHooks'
import { Acteur, ActeurFormData } from '@/simadou/allTypes/acteur'
import { getActeurFormConfig } from '@/simadou/allfieldsConfig/acteurForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { acteurSchema } from '@/simadou/schemas/acteurSchema'
import { useGetCategoriesActeur } from '@/simadou/allHooks/admin/categorieActeurHooks'
import { useActeurStore } from '@/stores/acteur-store'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Acteur | null
}

export default function AddActeur({
    open,
    onOpenChange,
    currentRow,
}: Props) {
    const isEdit = !!currentRow
    const { data: categorie_acteurs = [] } = useGetCategoriesActeur()
    const { selectedCategorieId } = useActeurStore()
    const preselectedCategorieId = selectedCategorieId
    const resolvedCategorieId = useMemo(() => {
        if (isEdit && currentRow) {
            const categorie = currentRow.categorie_acteur
            return typeof categorie === 'object' && categorie !== null
                ? categorie.id_categorie
                : categorie || null
        }
        return preselectedCategorieId ?? null
    }, [isEdit, currentRow, preselectedCategorieId])

    // Configuration du formulaire - ON GARDE le champ categorie_acteur
    const formConfig = useMemo(() => {
        const config = getActeurFormConfig()

        // On garde tous les champs, y compris categorie_acteur
        return {
            fields: config.fields.map((field) => {
                // Si c'est le champ categorie_acteur, on ajoute les options
                if (field.name === 'categorie_acteur') {
                    return {
                        ...field,
                        options: categorie_acteurs.map((categorie) => ({
                            label: categorie.nom_categorie || categorie.code_cat,
                            value: categorie.id_categorie
                        })),
                        // Optionnel : ajouter une valeur par défaut
                        defaultValue: resolvedCategorieId
                    }
                }
                return field
            })
        }
    }, [categorie_acteurs, resolvedCategorieId]) // Ajouter les dépendances

    // Valeurs par défaut du formulaire
    const defaultValues = useMemo(() => {
        if (isEdit && currentRow) {
            return {
                code_acteur: currentRow.code_acteur || '',
                nom_acteur: currentRow.nom_acteur || '',
                description_acteur: currentRow.description_acteur || '',
                personne_responsable: currentRow.personne_responsable || '',
                contact: currentRow.contact || '',
                adresse_email: currentRow.adresse_email || '',
                categorie_acteur: resolvedCategorieId, // Pré-rempli
            }
        }
        return {
            code_acteur: '',
            nom_acteur: '',
            description_acteur: '',
            personne_responsable: '',
            contact: '',
            adresse_email: '',
            categorie_acteur: resolvedCategorieId, // Valeur par défaut
        }
    }, [currentRow, isEdit, resolvedCategorieId])

    // Nom de la catégorie pour l'affichage dans le titre
    const selectedCategorieNom = useMemo(() => {
        if (!resolvedCategorieId) return ''
        return categorie_acteurs.find(
            (c: any) => c.id_categorie === resolvedCategorieId
        )?.nom_categorie || ''
    }, [categorie_acteurs, resolvedCategorieId])

    const mutation = useSaveActeur(isEdit, currentRow, () => {
        onOpenChange(false)
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={DIALOG_SIZES.lg}>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Modifier l'acteur" : "Ajouter un acteur"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Modification des informations de l'acteur${selectedCategorieNom ? ` — ${selectedCategorieNom}` : ''}`
                            : selectedCategorieNom
                                ? `Ajouter un acteur dans la catégorie "${selectedCategorieNom}"`
                                : "Ajouter un nouvel acteur"}
                    </DialogDescription>
                </DialogHeader>

                <DynamicForm
                    key={`${isEdit ? currentRow?.id_acteur : 'new'}-${resolvedCategorieId}, resolvedCategorieId`}
                    config={formConfig}
                    schema={acteurSchema}
                    defaultValues={defaultValues}
                    onSubmit={(data: ActeurFormData) => mutation.mutate(data)}
                    isLoading={mutation.isPending}
                    submitText={isEdit ? 'Mettre à jour' : 'Ajouter'}
                    loadingText='Enregistrement...'
                />
            </DialogContent>
        </Dialog>
    )
}
