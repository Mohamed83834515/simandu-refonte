import { useCallback, useMemo, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTableToolbarOutlineButton } from "@/components/data-table"
import { useDeleteTypeFinancementPPM, useGetTypeFinancementPPM } from "@/simadou/allHooks/admin/typeFinancementPPM"
import { TypeFinancementPPM } from "@/simadou/allTypes/typeFinancementPPM"
import { buildTypeFinancementPPMColumns } from "@/simadou/allColonnes/type-financement-ppm-columns"

export default function ListeTypeFinancementPPM({
    onAdd,
    onEdit,
}: {
    onAdd: () => void
    onEdit: (row: any) => void
}) {
    const { data: types_financement = [] } = useGetTypeFinancementPPM()
    const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
    const [currentRow, setCurrentRow] = useState<TypeFinancementPPM | null>(null)

    const handleEdit = useCallback((row: any) => {
        setCurrentRow(row)
        onEdit(row)
    }, [onEdit])
    const { search, navigate } = useEmbeddedTableState()
    const deleteMutation = useDeleteTypeFinancementPPM()

    const columns = useMemo(
        () => buildTypeFinancementPPMColumns(setOpen, setCurrentRow, handleEdit),
        [setOpen, setCurrentRow, handleEdit]
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Types de Financement PPM</CardTitle>
                <DataTableToolbarOutlineButton onClick={onAdd}>
                    Ajouter
                </DataTableToolbarOutlineButton>
            </CardHeader>
            <CardContent>
                <GenericTable
                    data={types_financement}
                    columns={columns}
                    search={search}
                    navigate={navigate}
                    searchKey='numero_version_ppm'
                    searchPlaceholder='Filtrer les types de financement de PPM...'
                    urlFilterConfig={[
                        {
                            columnId: 'numero_version_ppm',
                            searchKey: 'numero_version_ppm',
                            type: 'string',
                        },
                    ]}
                    defaultPageSize={10}
                    showViewOptions={true}
                    emptyMessage='Aucun type de financement de PPM trouvé.'
                />
                {currentRow && (
                    <GenericDialogs<TypeFinancementPPM, 'add' | 'edit' | 'delete'>
                        open={open}
                        setOpen={setOpen}
                        currentRow={currentRow}
                        setCurrentRow={setCurrentRow}
                        rowRequiredDialogs={['edit', 'delete']}
                        dialogMap={{
                            delete: (props) => (
                                <GenericDeleteDialog<TypeFinancementPPM>
                                    key={`type-financement-ppm-delete-${currentRow?.id_type_financement_ppm}`}
                                    {...props}
                                    currentRow={props.currentRow as TypeFinancementPPM}
                                    entityName='type-financement-ppm'
                                    getEntityLabel={(row) => row.intitule_type_financement_ppm}
                                    onDelete={(row) => deleteMutation.mutate(row.id_type_financement_ppm || 0)}
                                />
                            ),
                        }}
                    />
                )}


            </CardContent>
        </Card>
    )
}