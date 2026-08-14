import { useCallback, useMemo, useState } from "react"
import { useDeleteFonction, useGetFonctions } from "@/simadou/allHooks/admin/fonctionHooks"
import useDialogState from "@/hooks/use-dialog-state"
import { buildFonctionColumns } from "@/simadou/allColonnes/fonction-columns"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { Fonction } from "@/simadou/allTypes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTableToolbarOutlineButton } from "@/components/data-table"

export default function ListeFOnction({
    onAdd,
    onEdit,
}: {
    onAdd: () => void
    onEdit: (row: any) => void
}) {
    const { data: fonctions = [] } = useGetFonctions()
    const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
    const [currentRow, setCurrentRow] = useState<Fonction | null>(null)

    const handleEdit = useCallback((row: any) => {
        setCurrentRow(row)
        onEdit(row)
    }, [onEdit])
    const { search, navigate } = useEmbeddedTableState()
    const deleteMutation = useDeleteFonction()

    console.log('Fonctions récupérées:', fonctions) // Debug: Afficher les fonctions récupérées
    const columns = useMemo(
        () => buildFonctionColumns(setOpen, setCurrentRow, handleEdit),
        [setOpen, setCurrentRow, handleEdit]
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fonctions</CardTitle>
                <DataTableToolbarOutlineButton onClick={onAdd}>
                    Ajouter
                </DataTableToolbarOutlineButton>
            </CardHeader>
            <CardContent>
                <GenericTable
                    data={fonctions}
                    columns={columns}
                    search={search}
                    navigate={navigate}
                    searchKey='nom_fonction'
                    searchPlaceholder='Filtrer les fonctions...'
                    urlFilterConfig={[
                        {
                            columnId: 'nom_fonction',
                            searchKey: 'nom_fonction',
                            type: 'string',
                        },
                    ]}
                    defaultPageSize={10}
                    showViewOptions={true}
                    emptyMessage='Aucune unité de gestion trouvée.'
                />
                {currentRow && (
                    <GenericDialogs<Fonction, 'add' | 'edit' | 'delete'>
                        open={open}
                        setOpen={setOpen}
                        currentRow={currentRow}
                        setCurrentRow={setCurrentRow}
                        rowRequiredDialogs={['edit', 'delete']}
                        dialogMap={{
                            delete: (props) => (
                                <GenericDeleteDialog<Fonction>
                                    key={`fonction-delete-${currentRow?.id_fonction}`}
                                    {...props}
                                    currentRow={props.currentRow as Fonction}
                                    entityName='fonction'
                                    getEntityLabel={(row) => row.nom_fonction}
                                    onDelete={(row) => deleteMutation.mutate(row.id_fonction || 0)}
                                />
                            ),
                        }}
                    />
                )}


            </CardContent>
        </Card>
    )
}