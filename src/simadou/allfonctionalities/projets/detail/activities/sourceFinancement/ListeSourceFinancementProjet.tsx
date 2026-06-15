import { useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { SourFinancementProjet } from '@/simadou/allTypes/sourceFinancemanetProjet'
import useDialogState from '@/hooks/use-dialog-state'
import { useDeleteSourceFinancement } from '@/simadou/allHooks/admin/sourceFinancementProjetHooks'
import { toast } from 'sonner'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { buildSourceFinancementProjetColumns } from '@/simadou/allColonnes/sourceFinancementProjetColumns'
import { useGeneralParamsQuery } from '@/simadou/allHooks/generalParams/queries'

type ListeSourceFinancementProps = {
  sources: SourFinancementProjet[]
  idActivite: string | number
  onEdit: (source: SourFinancementProjet) => void
  onAdd: () => void
}

export default function ListeSourceFinancement({
  sources,
  idActivite,
  onEdit,
  onAdd
}: ListeSourceFinancementProps) {
  const { search, navigate } = useEmbeddedTableState()

  const [open, setOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] = useState<SourFinancementProjet | null>(null)

  const { data: config } = useGeneralParamsQuery()
  const currencyCode = config?.currencyCode

  const columns = useMemo(
    () => buildSourceFinancementProjetColumns(setOpen, setCurrentRow, onEdit, currencyCode),
    [onEdit, setOpen, setCurrentRow, currencyCode]
  )

  const deleteMutation = useDeleteSourceFinancement(idActivite as any)

  const handleConfirmDelete = (row: SourFinancementProjet) => {
    deleteMutation.mutate(row.id_source_financement, {
      onSuccess: () => {
        toast.success('Source supprimée avec succès')
        setOpen(null)
        setCurrentRow(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <div className="space-y-4">
        <GenericTable<SourFinancementProjet>
          data={sources}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='intitule_source_financement'
          searchPlaceholder='Filtrer les sources...'
          urlFilterConfig={[
            {
              columnId: 'intitule_source_financement',
              searchKey: 'intitule_source_financement',
              type: 'string',
            },
            {
              columnId: 'code_source_financement',
              searchKey: 'code_source_financement',
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
          defaultPageSize={5}
          showViewOptions={false}
          showPagination={true}
          showSearch={true}
          emptyMessage='Aucune source de financement pour cette activité.'
        />
      </div>

      <GenericDeleteDialog<SourFinancementProjet>
        open={open === 'delete'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
        currentRow={currentRow as any}
        entityName="la source de financement"
        getEntityLabel={(row) => row?.intitule_source_financement || ''}
        onDelete={handleConfirmDelete}
      />
    </>
  )
}