import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet, IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { buildIndicateurPerformanceProjetColumns } from '@/simadou/allColonnes/indicateur-performance-projet-columns'
import {
  useDeleteIndicateurPerformanceProjet,
  useGetAllIndicateursPerformanceProjet,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import { useGetUnitesIndicateur } from '@/simadou/allHooks/admin/uniteIndicateurHooks'
import IndicateurPerformanceProjetFormDialog from './IndicateurPerformanceProjetFormDialog'

export default function ProjetActivityIndicatorsPanel({ projet: _projet }: { projet: Projet }) {
  const { data: indicateurs = [], dataUpdatedAt } =
    useGetAllIndicateursPerformanceProjet()
  const { data: unites = [] } = useGetUnitesIndicateur()
  const deleteMutation = useDeleteIndicateurPerformanceProjet()
  const { search, navigate } = useEmbeddedTableState()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<IndicateurPerformanceProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [rowToDelete, setRowToDelete] = useState<IndicateurPerformanceProjet | null>(
    null
  )

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

  const resolveActiviteLabel = useCallback((ind: IndicateurPerformanceProjet) => {
    const v = ind.code_activite_projet
    if (v == null || v === '') return '—'
    if (typeof v === 'string') return v
    if (typeof v === 'object' && 'code_activite_projet' in v) {
      return String((v as { code_activite_projet: string }).code_activite_projet)
    }
    return '—'
  }, [])

  const handleEdit = useCallback((ind: IndicateurPerformanceProjet) => {
    setSelected(ind)
    setOpen(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (ind: IndicateurPerformanceProjet) => {
      setRowToDelete(ind)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const columns = useMemo(
    () =>
      buildIndicateurPerformanceProjetColumns({
        getUniteLabel: resolveUniteLabel,
        getActiviteLabel: resolveActiviteLabel,
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [resolveUniteLabel, resolveActiviteLabel, handleEdit, handleDeleteRequest]
  )

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
  }

  const handleConfirmDelete = (ind: IndicateurPerformanceProjet) => {
    deleteMutation.mutate(ind.id_indicateur_performance, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setRowToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error("Erreur lors de la suppression de l'indicateur"),
    })
  }

  return (
    <>
      <GenericTable<IndicateurPerformanceProjet>
        key={`indicateurs-perf-${dataUpdatedAt}-${indicateurs.length}`}
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
        defaultPageSize={10}
        showViewOptions={false}
        toolbarEndSlot={
          <DataTableToolbarOutlineButton
            className='ms-auto'
            onClick={() => {
              setSelected(null)
              setOpen(true)
            }}
          >
            Ajouter
          </DataTableToolbarOutlineButton>
        }
        emptyMessage='Aucun indicateur'
      />

      {rowToDelete && (
        <GenericDeleteDialog<IndicateurPerformanceProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={rowToDelete}
          entityName="l'indicateur"
          getEntityLabel={(row) => row.intitule_indicateur_tache}
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? "Modifier l'indicateur de performance"
                : 'Ajouter un indicateur de performance'}
            </DialogTitle>
          </DialogHeader>

          <IndicateurPerformanceProjetFormDialog
            indicateur={selected}
            onClose={handleClose}
            onSuccess={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
