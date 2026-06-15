// simadou/allfonctionalities/parametrage/categorie-acteur/ListeCategorieActeur.tsx
import { useCallback, useMemo, useState } from "react"
import { useDeleteCategorieActeur, useGetCategoriesActeur } from "@/simadou/allHooks/admin/categorieActeurHooks"
import useDialogState from "@/hooks/use-dialog-state"
import { GenericTable } from "@/Global/Generic/Generictable"
import { GenericDialogs } from "@/Global/Generic/Genericdialogs"
import { GenericDeleteDialog } from "@/Global/Tableaux/GenericDeleteDialog"
import { CategorieActeur } from "@/simadou/allTypes/categorieActeur"
import { useEmbeddedTableState } from "@/hooks/use-embedded-table-state"
import { DataTableToolbarOutlineButton } from "@/components/data-table/toolbar-outline-button"
import { buildCategorieActeurColumns } from "@/simadou/allColonnes/categorie-acteur-columns"

export default function ListeCategorieActeur({
  onAdd,
  onEdit,
}: {
  onAdd: () => void
  onEdit: (row: CategorieActeur) => void
}) {
  const { data = [] } = useGetCategoriesActeur()
  const [open, setOpen] = useDialogState<"add" | "edit" | "delete">(null)
  const [currentRow, setCurrentRow] = useState<CategorieActeur | null>(null)

  const { search, navigate } = useEmbeddedTableState()
  const deleteMutation = useDeleteCategorieActeur()

  const handleEdit = useCallback((row: CategorieActeur) => {
    setCurrentRow(row)
    onEdit(row)
  }, [onEdit])

  const columns = useMemo(
    () => buildCategorieActeurColumns(setOpen, setCurrentRow, handleEdit),
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
          emptyMessage="Aucune catégorie d'acteur."
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
              entityName="catégorie d'acteur"
              currentRow={props.currentRow as CategorieActeur}
              getEntityLabel={(row: CategorieActeur) => `${row.code_cat} - ${row.nom_categorie}`}
              onDelete={(row) => {
                deleteMutation.mutate(row?.id_categorie || 0)
                handleCloseDialogs()
              }}
            />
          ),
        }}
      />
    </>
  )
}