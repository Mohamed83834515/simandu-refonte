import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { SuiviDecaissementPtbaProjet } from '@/simadou/allTypes/suiviDecaissementPtbaProjet'
import { buildSuiviDecaissementPtbaProjetColumns } from '@/simadou/allColonnes/suivi-decaissement-ptba-projet-columns'
import { useDeleteSuiviDecaissementProjet } from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'

type Props = {
  suivis: SuiviDecaissementPtbaProjet[]
  idActivite: number
  onEdit: (row: SuiviDecaissementPtbaProjet) => void
  onAdd: () => void
}

export default function SuiviDecaissementPtbaProjetList({
  suivis,
  idActivite,
  onEdit,
  onAdd,
}: Props) {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] = useState<SuiviDecaissementPtbaProjet | null>(
    null
  )
  const deleteMutation = useDeleteSuiviDecaissementProjet(idActivite)

  const columns = useMemo(
    () =>
      buildSuiviDecaissementPtbaProjetColumns({
        onEdit,
        onDeleteRequest: (row) => {
          setCurrentRow(row)
          setOpen('delete')
        },
      }),
    [onEdit, setOpen]
  )

  const handleConfirmDelete = (row: SuiviDecaissementPtbaProjet) => {
    deleteMutation.mutate(row.id_suivi_dec, {
      onSuccess: () => toast.success('Décaissement supprimé'),
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<SuiviDecaissementPtbaProjet>
        data={suivis}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='observation'
        searchPlaceholder='Filtrer les décaissements…'
        urlFilterConfig={[
          {
            columnId: 'observation',
            searchKey: 'observation',
            type: 'string',
          },
        ]}
        defaultPageSize={10}
        showViewOptions={false}
        toolbarEndSlot={
          <DataTableToolbarOutlineButton className='ms-auto' onClick={onAdd}>
            Ajouter un décaissement
          </DataTableToolbarOutlineButton>
        }
        emptyMessage='Aucun décaissement enregistré'
      />

      {currentRow && (
        <GenericDeleteDialog<SuiviDecaissementPtbaProjet>
          open={open === 'delete'}
          onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
          currentRow={currentRow}
          entityName='décaissement'
          getEntityLabel={(row) =>
            row.observation || String(row.montant_decaisse)
          }
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  )
}
