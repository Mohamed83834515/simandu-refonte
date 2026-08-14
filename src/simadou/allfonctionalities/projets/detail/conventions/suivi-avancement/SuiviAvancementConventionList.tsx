import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { SuiviAvancementConvention } from '@/simadou/allTypes/suiviAvancementConvention'
import { buildSuiviAvancementConventionColumns } from '@/simadou/allColonnes/suivi-avancement-convention-columns'
import { useDeleteSuiviAvancementConvention } from '@/simadou/allHooks/admin/suiviConventionHooks'

type Props = {
  suivis: SuiviAvancementConvention[]
  idConvention: number
  onEdit: (row: SuiviAvancementConvention) => void
  onAdd: () => void
}

function formatDateLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function SuiviAvancementConventionList({
  suivis,
  idConvention,
  onEdit,
  onAdd,
}: Props) {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<SuiviAvancementConvention | null>(null)

  const deleteMutation = useDeleteSuiviAvancementConvention(idConvention)

  const columns = useMemo(
    () => buildSuiviAvancementConventionColumns(onEdit, setOpen, setCurrentRow),
    [onEdit, setOpen, setCurrentRow]
  )

  const handleConfirmDelete = (row: SuiviAvancementConvention) => {
    deleteMutation.mutate(row.id_suivi, {
      onSuccess: () => toast.success('Observation supprimée'),
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<SuiviAvancementConvention>
        data={suivis}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='observation'
        searchPlaceholder='Filtrer les observations…'
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
            Ajouter une observation
          </DataTableToolbarOutlineButton>
        }
        emptyMessage='Aucune observation globale'
      />

      {currentRow && (
        <GenericDeleteDialog<SuiviAvancementConvention>
          open={open === 'delete'}
          onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
          currentRow={currentRow}
          entityName='observation globale'
          getEntityLabel={(row) => formatDateLabel(row.date_suivi)}
          onDelete={handleConfirmDelete}
        />
      )}
    </>
  )
}
