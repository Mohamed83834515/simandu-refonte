import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { SuiviDecaissementConvention } from '@/simadou/allTypes/suiviDecaissementConvention'
import { buildSuiviDecaissementConventionColumns } from '@/simadou/allColonnes/suivi-decaissement-convention-columns'
import { useDeleteSuiviDecaissementConvention } from '@/simadou/allHooks/admin/suiviConventionHooks'

type Props = {
  suivis: SuiviDecaissementConvention[]
  idConvention: number
  onEdit: (row: SuiviDecaissementConvention) => void
  onAdd: () => void
}

export default function SuiviDecaissementConventionList({
  suivis,
  idConvention,
  onEdit,
  onAdd,
}: Props) {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<SuiviDecaissementConvention | null>(null)
  const deleteMutation = useDeleteSuiviDecaissementConvention(idConvention)

  const columns = useMemo(
    () =>
      buildSuiviDecaissementConventionColumns({
        onEdit,
        onDeleteRequest: (row) => {
          setCurrentRow(row)
          setOpen('delete')
        },
      }),
    [onEdit, setOpen]
  )

  const handleConfirmDelete = (row: SuiviDecaissementConvention) => {
    deleteMutation.mutate(row.id_suivi_dec, {
      onSuccess: () => toast.success('Décaissement supprimé'),
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<SuiviDecaissementConvention>
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
        <GenericDeleteDialog<SuiviDecaissementConvention>
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
