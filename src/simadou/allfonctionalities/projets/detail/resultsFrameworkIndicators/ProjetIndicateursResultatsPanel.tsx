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
import type { IndicateurCadreResultat, Projet } from '@/simadou/allTypes'
import { buildIndicateurCadreResultatColumns } from '@/simadou/allColonnes/indicateur-cadre-resultat-columns'
import {
  useDeleteIndicateurCadreResultat,
  useGetIndicateursCadreResultat,
} from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import IndicateurCadreResultatFormDialog from './IndicateurCadreResultatFormDialog'

export default function ProjetIndicateursResultatsPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: indicateurs = [], dataUpdatedAt } = useGetIndicateursCadreResultat()
  const deleteMutation = useDeleteIndicateurCadreResultat()
  const { search, navigate } = useEmbeddedTableState()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<IndicateurCadreResultat | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [rowToDelete, setRowToDelete] = useState<IndicateurCadreResultat | null>(null)

  const handleEdit = useCallback((ind: IndicateurCadreResultat) => {
    setSelected(ind)
    setOpen(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (ind: IndicateurCadreResultat) => {
      setRowToDelete(ind)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const columns = useMemo(
    () =>
      buildIndicateurCadreResultatColumns({
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [handleEdit, handleDeleteRequest]
  )

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
  }

  const handleConfirmDelete = (ind: IndicateurCadreResultat) => {
    deleteMutation.mutate(ind.id_indicateur_cr_iop, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setRowToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<IndicateurCadreResultat>
        key={`indicateurs-cr-${dataUpdatedAt}-${indicateurs.length}`}
        data={indicateurs}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule_indicateur_cr_iop'
        searchPlaceholder='Filtrer les indicateurs…'
        urlFilterConfig={[
          {
            columnId: 'intitule_indicateur_cr_iop',
            searchKey: 'intitule_indicateur_cr_iop',
            type: 'string',
          },
          {
            columnId: 'code_indicateur_cr_iop',
            searchKey: 'code_indicateur_cr_iop',
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
        <GenericDeleteDialog<IndicateurCadreResultat>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={rowToDelete}
          entityName="l'indicateur"
          getEntityLabel={(row) => row.intitule_indicateur_cr_iop}
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? "Modifier l'indicateur de cadre de résultat"
                : 'Créer un indicateur de cadre de résultat'}
            </DialogTitle>
          </DialogHeader>
          <IndicateurCadreResultatFormDialog
            codeProjet={codeProjet}
            indicateur={selected}
            onClose={handleClose}
            onSuccess={handleClose}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
