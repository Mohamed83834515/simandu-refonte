import { useCallback, useMemo, useState } from 'react'
import { Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { IndicateurCmr, Projet } from '@/simadou/allTypes'
import { buildIndicateurCmrColumns } from '@/simadou/allColonnes/indicateur-cmr-columns'
import {
  useDeleteIndicateurCmr,
  useGetIndicateursCmr,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import IndicateurCmrFormDialog from './IndicateurCmrFormDialog'
import IndicateurCmrDetailView from './IndicateurCmrDetailView'
import ProjetCiblesCmrDialog from './ProjetCiblesCmrDialog'

type ModalState = 'indicateur' | 'indicateurView'

export default function ProjetIndicateursCmrPanel({ projet }: { projet: Projet }) {
  const codeProjet = projet.code_projet
  const { data: indicateurs = [], dataUpdatedAt: indicateursUpdatedAt } =
    useGetIndicateursCmr()
  const deleteIndMutation = useDeleteIndicateurCmr()
  const { search, navigate } = useEmbeddedTableState()

  const [modal, setModal] = useState<ModalState | null>(null)
  const [ciblesOpen, setCiblesOpen] = useState(false)
  const [selectedIndicateurId, setSelectedIndicateurId] = useState<number | null>(
    null
  )
  const [selectedIndicateur, setSelectedIndicateur] = useState<IndicateurCmr | null>(null)

  const [indDeleteOpen, setIndDeleteOpen] = useDialogState<'delete'>(null)
  const [indToDelete, setIndToDelete] = useState<IndicateurCmr | null>(null)

  const closeAll = () => {
    setModal(null)
    setSelectedIndicateur(null)
    setSelectedIndicateurId(null)
  }

  const handleViewIndicateur = useCallback((ind: IndicateurCmr) => {
    setSelectedIndicateurId(ind.id_ref_ind_cmr)
    setModal('indicateurView')
  }, [])

  const handleEditIndicateur = useCallback((ind: IndicateurCmr) => {
    setSelectedIndicateur(ind)
    setModal('indicateur')
  }, [])

  const handleDeleteIndicateurRequest = useCallback(
    (ind: IndicateurCmr) => {
      setIndToDelete(ind)
      setIndDeleteOpen('delete')
    },
    [setIndDeleteOpen]
  )

  const indicateurColumns = useMemo(
    () =>
      buildIndicateurCmrColumns({
        onView: handleViewIndicateur,
        onEdit: handleEditIndicateur,
        onDeleteRequest: handleDeleteIndicateurRequest,
      }),
    [handleViewIndicateur, handleEditIndicateur, handleDeleteIndicateurRequest]
  )

  const handleConfirmDeleteIndicateur = (ind: IndicateurCmr) => {
    deleteIndMutation.mutate(ind.id_ref_ind_cmr, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setIndToDelete(null)
        setIndDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  return (
    <>
      <GenericTable<IndicateurCmr>
        key={`indicateurs-cmr-${indicateursUpdatedAt}-${indicateurs.length}`}
        data={indicateurs}
        columns={indicateurColumns}
        search={search}
        navigate={navigate}
        searchKey='intitule_ref_ind'
        searchPlaceholder='Filtrer les indicateurs CMR…'
        urlFilterConfig={[
          {
            columnId: 'intitule_ref_ind',
            searchKey: 'intitule_ref_ind',
            type: 'string',
          },
          {
            columnId: 'code_ref_ind',
            searchKey: 'code_ref_ind',
            type: 'string',
          },
        ]}
        defaultPageSize={10}
        showViewOptions={false}
        toolbarEndSlot={
          <div className='ms-auto flex flex-col gap-2 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 border-dashed'
              onClick={() => setCiblesOpen(true)}
            >
              <Target className='h-4 w-4' />
              Cibles CMR
            </Button>
            <DataTableToolbarOutlineButton
              onClick={() => {
                setSelectedIndicateur(null)
                setModal('indicateur')
              }}
            >
              Ajouter
            </DataTableToolbarOutlineButton>
          </div>
        }
        emptyMessage='Aucun indicateur CMR'
      />

      {indToDelete && (
        <GenericDeleteDialog<IndicateurCmr>
          open={indDeleteOpen === 'delete'}
          onOpenChange={(isOpen) => setIndDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={indToDelete}
          entityName="l'indicateur CMR"
          getEntityLabel={(row) => row.intitule_ref_ind}
          onDelete={handleConfirmDeleteIndicateur}
        />
      )}

      <ProjetCiblesCmrDialog
        codeProjet={codeProjet}
        open={ciblesOpen}
        onOpenChange={setCiblesOpen}
      />

      <Dialog open={modal === 'indicateur'} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              {selectedIndicateur
                ? "Modifier l'indicateur CMR"
                : 'Créer un indicateur CMR'}
            </DialogTitle>
            <DialogDescription>
              {selectedIndicateur
                ? "Mettez à jour les informations de l'indicateur CMR."
                : 'Renseignez les informations du nouvel indicateur CMR.'}
            </DialogDescription>
          </DialogHeader>
          <IndicateurCmrFormDialog
            indicateur={selectedIndicateur}
            onClose={closeAll}
            onSuccess={closeAll}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'indicateurView'} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-2xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Indicateur CMR</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-5'>
            {selectedIndicateurId != null ? (
              <IndicateurCmrDetailView
                indicateurId={selectedIndicateurId}
                onClose={closeAll}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
