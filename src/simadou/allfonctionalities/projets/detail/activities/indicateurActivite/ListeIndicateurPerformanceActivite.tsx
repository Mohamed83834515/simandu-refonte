import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { buildIndicateurPerformanceProjetColumns } from '@/simadou/allColonnes/indicateur-performance-projet-columns'
import {
  useDeleteIndicateurPerformanceProjet,
  indicateurPerformanceProjetQueryKeys,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'

type ListeIndicateurPerformanceProps = {
  indicateurs: IndicateurPerformanceProjet[]
  idActivite: string
  onEdit: (row: IndicateurPerformanceProjet) => void
  onAdd: () => void
}

export default function ListeIndicateurPerformance({
  indicateurs,
  idActivite,
  onEdit,
  onAdd
}: ListeIndicateurPerformanceProps) {
  const queryClient = useQueryClient()
  const { search, navigate } = useEmbeddedTableState()

  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] = useState<IndicateurPerformanceProjet | null>(null)

  const { data: unites = [] } = useGetUnitesIndicateur()
  const deleteMutation = useDeleteIndicateurPerformanceProjet()

  const resolveUniteLabel = useCallback(
    (ind: IndicateurPerformanceProjet) => {
      const v = ind.unite_indicateur_performance
      const id =
        typeof v === 'number'
          ? v
          : v && typeof v === 'object' && 'id_unite' in v
            ? Number((v as { id_unite: number }).id_unite)
            : null
      if (id == null) return '—'
      const unite = unites.find((u) => u.id_unite === id)
      return unite ? `${unite.unite_ui} — ${unite.definition_ui}` : String(id)
    },
    [unites]
  )

  const columns = useMemo(
    () =>
      buildIndicateurPerformanceProjetColumns({
        getUniteLabel: resolveUniteLabel,
        onEdit,
        onDeleteRequest: (row) => {
          setCurrentRow(row)
          setDeleteOpen('delete')
        },
      }),
    [resolveUniteLabel, onEdit]
  )

  const handleConfirmDelete = (row: IndicateurPerformanceProjet) => {
    deleteMutation.mutate(row.id_indicateur_performance, {
      onSuccess: () => {
        toast.success('Indicateur supprimé avec succès')
        setCurrentRow(null)
        setDeleteOpen(null)
        queryClient.invalidateQueries({
          queryKey: indicateurPerformanceProjetQueryKeys.byActivite(idActivite),
        })
      },
      onError: () => toast.error("Erreur lors de la suppression de l'indicateur"),
    })
  }

  return (
    <>
      <div className="space-y-4">
        <GenericTable<IndicateurPerformanceProjet>
          data={indicateurs}
          columns={columns}
          search={search}
          navigate={navigate}
          searchKey='intitule_indicateur_tache'
          searchPlaceholder='Filtrer les indicateurs…'
          urlFilterConfig={[
            {
              columnId: 'intitule_indicateur_tache',
              searchKey: 'intitule_indicateur_tache',
              type: 'string',
            },
            {
              columnId: 'code_indicateur_performance',
              searchKey: 'code_indicateur_performance',
              type: 'string',
            },
          ]}
          defaultPageSize={5}
          showViewOptions={false}
          showPagination={true}
          showSearch={true}
          toolbarEndSlot={
            <DataTableToolbarOutlineButton
              className='ms-auto'
              onClick={onAdd}
            >
              Ajouter
            </DataTableToolbarOutlineButton>
          }
          emptyMessage='Aucun indicateur de performance pour cette activité.'
        />
      </div>

      <GenericDeleteDialog<IndicateurPerformanceProjet>
        open={deleteOpen === 'delete'}
        onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
        currentRow={currentRow as any}
        entityName="l'indicateur"
        getEntityLabel={(row) => row?.intitule_indicateur_tache || ''}
        onDelete={handleConfirmDelete}
      />
    </>
  )
}