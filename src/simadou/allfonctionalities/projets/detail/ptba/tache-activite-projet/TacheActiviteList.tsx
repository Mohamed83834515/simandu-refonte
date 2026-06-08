import { useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { TacheActivitePtba } from '@/simadou/allTypes'
import { buildTachePtbaColumns, TachePtbaTableRow } from '@/simadou/allColonnes/tache-activites-columns'
import useDialogState from '@/hooks/use-dialog-state'
import { toast } from 'sonner'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { useDeleteTachePtbaProjet } from '@/simadou/allHooks/admin/tacheActiviteProjetHooks'

type SuiviTacheActiviteListProps = {
  taches: TacheActivitePtba[]
  idActivite: number
  onEdit: (tache: TacheActivitePtba) => void
  onAdd: () => void
}

export default function TacheActiviteProjetList({
  taches,
  idActivite,
  onEdit,
  onAdd
}: SuiviTacheActiviteListProps) {
  const { search, navigate } = useEmbeddedTableState()

  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<TacheActivitePtba | null>(null)

  const columns = useMemo(
    () => buildTachePtbaColumns(setOpen, setCurrentRow, onEdit),
    [onEdit, setOpen, setCurrentRow]
  )

  const deleteMutation = useDeleteTachePtbaProjet(idActivite)


  const handleConfirmDelete = (row: TacheActivitePtba) => {
    deleteMutation.mutate(row.id_groupe_tache, {
      onSuccess: () => toast.success('Tache supprimée avec succes'),
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }
  return (
    <>
      <div className="space-y-4">
        {/* <div className="flex justify-end">
          <Button
            onClick={onAdd}
            variant="outline"
          >
            Ajouter une tache
          </Button>
        </div> */}

        <GenericTable<TachePtbaTableRow>
          data={taches}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='intutile_tache_gt'
          searchPlaceholder='Filtrer les tâches...'
          urlFilterConfig={[
            {
              columnId: 'intutile_tache_gt',
              searchKey: 'intutile_tache_gt',
              type: 'string',
            },
          ]}
          toolbarEndSlot={
            <DataTableToolbarOutlineButton
              className='ms-auto'
              onClick={onAdd}
            >
              Ajouter
            </DataTableToolbarOutlineButton>
          }
          defaultPageSize={10}
          showViewOptions={false}
          showPagination={false}
          showSearch={false}
          emptyMessage='Aucune tâche planifiée pour cette activité.'
        />
      </div>

      {currentRow && (
        <GenericDeleteDialog<TacheActivitePtba>
          open={open === 'delete'}
          onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
          currentRow={currentRow}
          entityName='observation globale'
          getEntityLabel={(row) => row.intutile_tache_gt}
          onDelete={handleConfirmDelete}
        />
      )}

    </>
  )
}
