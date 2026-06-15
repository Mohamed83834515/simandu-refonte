// simadou/allfonctionalities/parametrage/type-zone/ListeTypeZone.tsx
import { useCallback, useMemo, useState } from "react"
import { useDeleteTypeZone, useGetTypeZones } from "@/simadou/allHooks/admin/typeZoneHooks"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { DataTableToolbarOutlineButton } from "@/components/data-table/toolbar-outline-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildTypeZoneColumns } from "@/simadou/allColonnes/type-zone-columns"

export default function ListeTypeZone({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: any) => void
}) {
  const { data = [] } = useGetTypeZones()
  const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
  const [currentRow, setCurrentRow] = useState<any>(null)

  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteTypeZone()

  const handleEdit = useCallback((row: any) => {
    setCurrentRow(row)
    onEdit(row)
  }, [onEdit])

  const columns = useMemo(
    () => buildTypeZoneColumns(setOpen, setCurrentRow, handleEdit),
    [handleEdit]
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Types de zones</CardTitle>
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
                entityName="type de zone"
                currentRow={props.currentRow}
                getEntityLabel={(row: any) => `${row.code_type_zone} - ${row.nom_type_zone}`}
                onDelete={(row) => deleteMutation.mutate(row?.id_type_zone || 0)}
              />
            ),
          }}
        />
      </CardContent>
    </Card>
  )
}