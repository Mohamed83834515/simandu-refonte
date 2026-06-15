import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { SuiviAvancementContrat } from '@/simadou/allTypes'
import { buildSuiviAvancementContratColumns } from '@/simadou/allColonnes/suivi-avancement-contrat-columns'
import { useDeleteSuiviAvancementProjet } from '@/simadou/allHooks/admin/suiviPtbaProjetHooks'

type SuiviAvancementContratListProps = {
  suivis: SuiviAvancementContrat[]
  idActivite: number
  onEdit: (row: SuiviAvancementContrat) => void
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

export default function SuiviAvancementContratProjetList({
  suivis,
  idActivite,
  onEdit,
  onAdd,
}: SuiviAvancementContratListProps) {
  const { search, navigate } = useEmbeddedTableState()
  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<SuiviAvancementContrat | null>(null)

  const deleteMutation = useDeleteSuiviAvancementProjet(idActivite)

  const columns = useMemo(
    () => buildSuiviAvancementContratColumns(onEdit, setOpen, setCurrentRow),
    [onEdit, setOpen, setCurrentRow]
  )

  const handleConfirmDelete = (row: SuiviAvancementContrat) => {
    deleteMutation.mutate(row.id_suivi, {
      onSuccess: () => toast.success('Suivi supprimé'),
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<SuiviAvancementContrat>
        data={suivis}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='observation'
        searchPlaceholder='Filtrer les observations...'
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
          <DataTableToolbarOutlineButton
            className='ms-auto'
            onClick={onAdd}
          >
            Ajouter un suivi
          </DataTableToolbarOutlineButton>
        }
        emptyMessage="Aucune observation globale sur l'activité"
      />

      {currentRow && (
        <GenericDeleteDialog<SuiviAvancementContrat>
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
