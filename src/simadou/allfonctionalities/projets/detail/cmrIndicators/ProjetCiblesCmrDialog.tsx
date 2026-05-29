import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { CibleCmrProjet } from '@/simadou/allTypes'
import { buildCibleCmrProjetColumns } from '@/simadou/allColonnes/cible-cmr-projet-columns'
import {
  useDeleteCibleCmrProjet,
  useGetCiblesCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetIndicateursCadreResultat } from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import { uglService } from '@/simadou/allSercices/uglService'
import { formatAnneeCible, formatValeurCible } from '@/simadou/schemas/cibleCmrProjetSchema'
import CibleCmrProjetFormDialog from './CibleCmrProjetFormDialog'
import CibleCmrProjetDetailView from './CibleCmrProjetDetailView'

type CiblesModal = 'list' | 'form' | 'view'

export default function ProjetCiblesCmrDialog({
  codeProjet,
  open,
  onOpenChange,
}: {
  codeProjet: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: cibles = [], dataUpdatedAt } = useGetCiblesCmrProjet(codeProjet)
  const { data: indicateurs = [] } = useGetIndicateursCadreResultat()
  const { data: ugls = [] } = useQuery({
    queryKey: ['ugls'],
    queryFn: () => uglService.getAll(),
  })
  const deleteMutation = useDeleteCibleCmrProjet(codeProjet)
  const tableState = useEmbeddedTableState()

  const [modal, setModal] = useState<CiblesModal>('list')
  const [selectedCible, setSelectedCible] = useState<CibleCmrProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cibleToDelete, setCibleToDelete] = useState<CibleCmrProjet | null>(null)

  useEffect(() => {
    if (!open) {
      setModal('list')
      setSelectedCible(null)
    }
  }, [open])

  const closeDialog = () => {
    onOpenChange(false)
    setModal('list')
    setSelectedCible(null)
  }

  const backToList = () => {
    setModal('list')
    setSelectedCible(null)
  }

  const handleView = useCallback((cible: CibleCmrProjet) => {
    setSelectedCible(cible)
    setModal('view')
  }, [])

  const handleEdit = useCallback((cible: CibleCmrProjet) => {
    setSelectedCible(cible)
    setModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (cible: CibleCmrProjet) => {
      setCibleToDelete(cible)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const columns = useMemo(
    () =>
      buildCibleCmrProjetColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
        hideProjetColumn: true,
        indicateurs,
        ugls,
      }),
    [handleView, handleEdit, handleDeleteRequest, indicateurs, ugls]
  )

  const handleConfirmDelete = (cible: CibleCmrProjet) => {
    deleteMutation.mutate(cible.id_cible_indicateur_crp, {
      onSuccess: () => {
        toast.success('Cible supprimée')
        setCibleToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) closeDialog()
  }

  return (
    <>
      {cibleToDelete && (
        <GenericDeleteDialog<CibleCmrProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cibleToDelete}
          entityName='la cible CMR'
          getEntityLabel={(row) =>
            `cible ${formatAnneeCible(row.annee)} (${formatValeurCible(Number(row.valeur_cible_indcateur_crp ?? 0))})`
          }
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open && modal === 'list'} onOpenChange={handleOpenChange}>
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-4xl'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Cibles CMR</DialogTitle>
          </DialogHeader>

          <div className='px-6 py-4'>
            <GenericTable<CibleCmrProjet>
              key={`cibles-cmr-${dataUpdatedAt}-${cibles.length}`}
              data={cibles}
              columns={columns}
              search={tableState.search}
              navigate={tableState.navigate}
              searchKey='code_indicateur_crp'
              searchPlaceholder='Filtrer par intitulé indicateur…'
              urlFilterConfig={[
                {
                  columnId: 'code_indicateur_crp',
                  searchKey: 'code_indicateur_crp',
                  type: 'string',
                },
                {
                  columnId: 'annee',
                  searchKey: 'annee',
                  type: 'string',
                },
              ]}
              defaultPageSize={10}
              showViewOptions={false}
              toolbarEndSlot={
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='ms-auto h-8'
                  onClick={() => {
                    setSelectedCible(null)
                    setModal('form')
                  }}
                >
                  <Plus className='h-4 w-4' />
                  Ajouter une cible
                </Button>
              }
              emptyMessage='Aucune cible pour ce projet'
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open && modal === 'view'} onOpenChange={(o) => !o && backToList()}>
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Cible CMR projet</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            {selectedCible ? (
              <CibleCmrProjetDetailView cible={selectedCible} onClose={backToList} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open && modal === 'form'} onOpenChange={(o) => !o && backToList()}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedCible
                ? 'Modifier la cible CMR projet'
                : 'Ajouter une cible CMR projet'}
            </DialogTitle>
          </DialogHeader>
          <CibleCmrProjetFormDialog
            codeProjet={codeProjet}
            cible={selectedCible}
            onClose={backToList}
            onSuccess={backToList}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
