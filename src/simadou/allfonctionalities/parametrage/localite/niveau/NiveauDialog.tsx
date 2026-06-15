// simadou/allfonctionalities/parametrage/localite/NiveauLocaliteDialog.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { useGetNiveauxLocalite, useSaveNiveauxLocalite, useDeleteNiveauLocalite } from '@/simadou/allHooks/admin/niveauLocaliteHooks'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import useDialogState from '@/hooks/use-dialog-state'
import { Button } from '@/components/ui/button'
import { PlusIcon, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NiveauLocalite } from '@/simadou/allTypes/niveauLocalite'

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export default function NiveauLocaliteDialog({ open, onOpenChange, onSuccess }: Props) {
    const { data: niveaux = [] } = useGetNiveauxLocalite()
    const [openDelete, setOpenDelete] = useDialogState<'delete'>(null)
    const [currentRow, setCurrentRow] = useState<any>(null)
    const { search, navigate } = useEmbeddedTableState()

    const saveMutation = useSaveNiveauxLocalite()
    const deleteMutation = useDeleteNiveauLocalite()

    // État pour les nouveaux niveaux
    const [newNiveaux, setNewNiveaux] = useState<Partial<NiveauLocalite>[]>([
        { libelle_nlc: '', Code_number_nlc: 0 }
    ])

    // Ajouter une ligne de formulaire
    const addFormRow = () => {
        setNewNiveaux([...newNiveaux, { libelle_nlc: '', Code_number_nlc: 0 }])
    }

    // Supprimer une ligne de formulaire
    const removeFormRow = (index: number) => {
        setNewNiveaux(newNiveaux.filter((_, i) => i !== index))
    }

    // Mettre à jour une ligne
    const updateFormRow = (index: number, field: string, value: any) => {
        const updated = [...newNiveaux]
        updated[index] = { ...updated[index], [field]: value }
        setNewNiveaux(updated)
    }

    // Enregistrer tous les nouveaux niveaux
    const handleSaveAll = () => {
        // Filtrer les lignes vides
        const validNiveaux = newNiveaux.filter(
            (n) => n.libelle_nlc?.trim() && n.Code_number_nlc && n.Code_number_nlc > 0
        )

        if (validNiveaux.length === 0) {
            return
        }

        // Ajouter le numéro de niveau automatiquement
        const niveauxToSave = validNiveaux.map((niveau, idx) => ({
            ...niveau,
            nombre_nlc: niveaux.length + idx + 1,
        }))

        saveMutation.mutate(niveauxToSave as NiveauLocalite[], {
            onSuccess: () => {
                setNewNiveaux([{ libelle_nlc: '', Code_number_nlc: 0 }])
                onSuccess?.()
                onOpenChange(false)
            },
        })
    }

    // ✅ Colonnes avec suppression uniquement sur le dernier niveau
    const columns = [
        { accessorKey: 'nombre_nlc', header: 'Niveau' },
        { accessorKey: 'libelle_nlc', header: 'Libellé' },
        { accessorKey: 'Code_number_nlc', header: 'Taille code' },
        {
            id: 'actions',
            cell: ({ row }: any) => {
                const isLastLevel = row.original.nombre_nlc === niveaux.length
                return (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => {
                            setCurrentRow(row.original)
                            setOpenDelete('delete')
                        }}
                        disabled={!isLastLevel} // ✅ Désactiver si ce n'est pas le dernier niveau
                    >
                        <Trash2 size={16} />
                    </Button>
                )
            },
        },
    ]

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={DIALOG_SIZES.lg}>
                    <DialogHeader>
                        <DialogTitle>Configuration des niveaux de localité</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">


                        {/* Formulaire d'ajout de nouveaux niveaux (inline) */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">Ajouter de nouveaux niveaux</h4>
                                <Button onClick={addFormRow} variant="outline" size="sm">
                                    <PlusIcon className="mr-1 h-4 w-4" />
                                    Ajouter une ligne
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {newNiveaux.map((niveau, idx) => (
                                    <div key={idx} className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground mb-1 block">
                                                Libellé
                                            </Label>
                                            <Input
                                                placeholder="Ex: Région, Département..."
                                                value={niveau.libelle_nlc}
                                                onChange={(e) => updateFormRow(idx, 'libelle_nlc', e.target.value)}
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-xs text-muted-foreground mb-1 block">
                                                Taille code
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="Ex: 2"
                                                value={niveau.Code_number_nlc || ''}
                                                onChange={(e) => updateFormRow(idx, 'Code_number_nlc', parseInt(e.target.value) || 0)}
                                                className="h-9"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-red-500"
                                            onClick={() => removeFormRow(idx)}
                                            disabled={newNiveaux.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {newNiveaux.some(n => n.libelle_nlc?.trim() && n.Code_number_nlc && n.Code_number_nlc > 0) && (
                                <div className="flex justify-end mt-4">
                                    <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? 'Enregistrement...' : `Enregistrer (${newNiveaux.filter(n => n.libelle_nlc?.trim() && n.Code_number_nlc).length})`}
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* Tableau des niveaux existants */}
                        <GenericTable
                            data={niveaux}
                            columns={columns}
                            search={search}
                            navigate={navigate}
                            showSearch={false}
                            showPagination={false}
                            showViewOptions={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de suppression */}
            <GenericDeleteDialog
                open={openDelete === 'delete'}
                onOpenChange={(isOpen) => setOpenDelete(isOpen ? 'delete' : null)}
                currentRow={currentRow}
                entityName="le niveau"
                getEntityLabel={(row) => row?.libelle_nlc}
                onDelete={() => {
                    if (currentRow?.id_nlc) deleteMutation.mutate(currentRow.id_nlc)
                    setOpenDelete(null)
                }}
            />
        </>
    )
}