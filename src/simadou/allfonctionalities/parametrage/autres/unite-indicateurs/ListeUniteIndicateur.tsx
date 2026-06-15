// simadou/allfonctionalities/parametrage/unite-indicateur/ListeUniteIndicateur.tsx
import { useCallback, useMemo, useState } from "react"
import { useDeleteUniteIndicateur, useGetUnitesIndicateur } from "@/simadou/allHooks/admin/uniteIndicateurHooks"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { DataTableToolbarOutlineButton } from "@/components/data-table/toolbar-outline-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildUniteIndicateurColumns } from "@/simadou/allColonnes/unite-indicateur-columns"

export default function ListeUniteIndicateur({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: any) => void
}) {
  const { data = [] } = useGetUnitesIndicateur()
  const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
  const [currentRow, setCurrentRow] = useState<any>(null)

  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteUniteIndicateur()

  const handleEdit = useCallback((row: any) => {
    setCurrentRow(row)
    onEdit(row)
  }, [onEdit])

  const columns = useMemo(
    () => buildUniteIndicateurColumns(setOpen, setCurrentRow, handleEdit),
    [handleEdit]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unités d'indicateur</CardTitle>
        <DataTableToolbarOutlineButton onClick={onAdd}>
          Ajouter
        </DataTableToolbarOutlineButton>
      </CardHeader>
      <CardContent>
        <GenericTable
          data={data}
          columns={columns}
          search={search}
          showSearch={false}
          showPagination={false}
          navigate={navigate}
          showViewOptions={false}
        />

        <GenericDialogs
          open={open}
          setOpen={setOpen}
          currentRow={currentRow}
          setCurrentRow={setCurrentRow}
          rowRequiredDialogs={["edit", "delete"]}
          dialogMap={{
            delete: (props) => (
              <GenericDeleteDialog
                {...props}
                entityName="unité d'indicateur"
                currentRow={props.currentRow}
                getEntityLabel={(row: any) => row.unite_ui}
                onDelete={(row) => deleteMutation.mutate(row?.id_unite || 0)}
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  )
}