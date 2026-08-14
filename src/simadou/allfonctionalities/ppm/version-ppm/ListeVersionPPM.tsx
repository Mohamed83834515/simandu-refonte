import { useCallback, useMemo, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTableToolbarOutlineButton } from "@/components/data-table"
import { VersionPPM } from "@/simadou/allTypes/versionPPM"
import { useDeleteVersionPPM, useGetVersionsPPM } from "@/simadou/allHooks/admin/versionPPMHooks"
import { buildVersionPPMColumns } from "@/simadou/allColonnes/version-ppm-columns"

export default function ListeVersionPPM({
    onAdd,
    onEdit,
}: {
    onAdd: () => void
    onEdit: (row: any) => void
}) {
    const { data: versions = [] } = useGetVersionsPPM()
    const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
    const [currentRow, setCurrentRow] = useState<VersionPPM | null>(null)

    const handleEdit = useCallback((row: any) => {
        setCurrentRow(row)
        onEdit(row)
    }, [onEdit])
    const { search, navigate } = useEmbeddedTableState()
    const deleteMutation = useDeleteVersionPPM()

    const columns = useMemo(
        () => buildVersionPPMColumns(setOpen, setCurrentRow, handleEdit),
        [setOpen, setCurrentRow, handleEdit]
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Versions PPM</CardTitle>
                <DataTableToolbarOutlineButton onClick={onAdd}>
                    Ajouter
                </DataTableToolbarOutlineButton>
            </CardHeader>
            <CardContent>
                <GenericTable
                    data={versions}
                    columns={columns}
                    search={search}
                    navigate={navigate}
                    searchKey='numero_version_ppm'
                    searchPlaceholder='Filtrer les versions de PPM...'
                    urlFilterConfig={[
                        {
                            columnId: 'numero_version_ppm',
                            searchKey: 'numero_version_ppm',
                            type: 'string',
                        },
                    ]}
                    defaultPageSize={10}
                    showViewOptions={true}
                    emptyMessage='Aucune version de PPM trouvée.'
                />
                {currentRow && (
                    <GenericDialogs<VersionPPM, 'add' | 'edit' | 'delete'>
                        open={open}
                        setOpen={setOpen}
                        currentRow={currentRow}
                        setCurrentRow={setCurrentRow}
                        rowRequiredDialogs={['edit', 'delete']}
                        dialogMap={{
                            delete: (props) => (
                                <GenericDeleteDialog<VersionPPM>
                                    key={`version-ppm-delete-${currentRow?.id_version_ppm}`}
                                    {...props}
                                    currentRow={props.currentRow as VersionPPM}
                                    entityName='version-ppm'
                                    getEntityLabel={(row) => row.numero_version_ppm}
                                    onDelete={(row) => deleteMutation.mutate(row.id_version_ppm || 0)}
                                />
                            ),
                        }}
                    />
                )}


            </CardContent>
        </Card>
    )
}