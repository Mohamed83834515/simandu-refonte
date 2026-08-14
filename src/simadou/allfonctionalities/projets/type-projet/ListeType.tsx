// simadou/allfonctionalities/parametrage/categorie-acteur/ListeTypeProjet.tsx
import { useCallback, useMemo, useState } from "react"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { DataTableToolbarOutlineButton } from "@/components/data-table/toolbar-outline-button"
import { useDeleteTypeProjet, useGetTypeProjet } from "@/simadou/allHooks/admin/typeProjetHooks"
import { TypeProjet } from "@/simadou/allTypes/typeProjet"
import { buildTypeProjetColumns } from "@/simadou/allColonnes/type-projet-columns"

export default function ListeTypeProjet({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: TypeProjet) => void
}) {
  const { data = [] } = useGetTypeProjet()
  const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
  const [currentRow, setCurrentRow] = useState<TypeProjet | null>(null)

  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteTypeProjet()

  const handleEdit = useCallback((row: TypeProjet) => {
    setCurrentRow(row)
    onEdit(row)
  }, [onEdit])

  const columns = useMemo(
    () => buildTypeProjetColumns(setOpen, setCurrentRow, handleEdit),
    [handleEdit]
  )

  const handleCloseDialogs = useCallback(() => {
    setOpen(null)
    setCurrentRow(null)
  }, [setOpen])

  return (
    <>
      <div className='@container/content flex min-h-[14rem] w-full min-w-0 flex-1 flex-col'>
        <GenericTable
          data={data}
          columns={columns}
          search={search}
          showSearch={false}
          navigate={navigate}
          defaultPageSize={5}
          tableContainerClassName='min-h-[10rem] max-h-[min(45vh,22rem)] flex-1 overflow-y-auto'
          showViewOptions={false}
          emptyMessage="Aucun type de projet trouver."
          toolbarEndSlot={
            <DataTableToolbarOutlineButton
              className='ms-auto shrink-0'
              onClick={onAdd}
            >
              Ajouter
            </DataTableToolbarOutlineButton>
          }
        />
      </div>

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
              entityName="type de projet"
              currentRow={props.currentRow as TypeProjet}
              getEntityLabel={(row: TypeProjet) => `${row.code_type_projet} - ${row.nom_type_projet}`}
              onDelete={(row) => {
                deleteMutation.mutate(row?.id_type_projet || 0)
                handleCloseDialogs()
              }}
            />
          ),
        }}
      />
    </>
  )
}