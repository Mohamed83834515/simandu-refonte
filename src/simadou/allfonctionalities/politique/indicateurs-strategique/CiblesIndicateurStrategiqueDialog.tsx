import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { buildCibleIndicateurStrategiqueColumns } from '@/simadou/allColonnes/cible-indicateur-strategique-columns'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { CibleIndicateurStrategique } from '@/simadou/allTypes/cibleIndicateurStrategique'
import {
  useDeleteCibleIndicateurStrategique,
  useGetCiblesIndicateurStrategique,
} from '@/simadou/allHooks/admin/cibleIndicateurStrategiqueHooks'
import { useGetUgls } from '@/simadou/allHooks/admin/uglHooks'
import { formatAnneeCible } from '@/simadou/schemas/cibleCmrProjetSchema'
import { resolveIndicateurStrategiqueCode } from './indicateurStrategiqueFormUtils'
import CibleIndicateurStrategiqueFormPanel from './CibleIndicateurStrategiqueFormPanel'

type Modal = 'list' | 'form'

type OpenProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicateurCode: string
  indicateurLabel: string
}

export default function CiblesIndicateurStrategiqueDialog({
  open,
  onOpenChange,
  indicateurCode,
  indicateurLabel,
}: OpenProps) {
  const { data: cibles = [], dataUpdatedAt } = useGetCiblesIndicateurStrategique()
  const { data: ugls = [] } = useGetUgls()
  const deleteMutation = useDeleteCibleIndicateurStrategique()
  const tableState = useEmbeddedTableState()

  const [modal, setModal] = useState<Modal>('list')
  const [selectedCible, setSelectedCible] =
    useState<CibleIndicateurStrategique | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cibleToDelete, setCibleToDelete] =
    useState<CibleIndicateurStrategique | null>(null)

  useEffect(() => {
    if (!open) {
      setModal('list')
      setSelectedCible(null)
    }
  }, [open])

  const filteredCibles = useMemo(
    () =>
      cibles.filter(
        (c) =>
          resolveIndicateurStrategiqueCode(c.code_indicateur_istr) ===
          indicateurCode
      ),
    [cibles, indicateurCode]
  )

  const handleEdit = useCallback((cible: CibleIndicateurStrategique) => {
    setSelectedCible(cible)
    setModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (cible: CibleIndicateurStrategique) => {
      setCibleToDelete(cible)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const columns = useMemo(
    () =>
      buildCibleIndicateurStrategiqueColumns({
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
        ugls,
      }),
    [handleEdit, handleDeleteRequest, ugls]
  )

  const handleConfirmDelete = (cible: CibleIndicateurStrategique) => {
    deleteMutation.mutate(cible.id_cible_indicateur_istr, {
      onSuccess: () => {
        toast.success('Cible supprimée')
        setCibleToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  const backToList = () => {
    setModal('list')
    setSelectedCible(null)
  }

  return (
    <>
      {cibleToDelete && (
        <GenericDeleteDialog<CibleIndicateurStrategique>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cibleToDelete}
          entityName='la cible'
          getEntityLabel={(row) =>
            `${formatAnneeCible(row.annee)} — ${row.valeur_cible_indcateur_istr}`
          }
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open && modal === 'list'} onOpenChange={onOpenChange}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-3xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Cibles — {indicateurLabel}</DialogTitle>
          </DialogHeader>
          <div className='px-6 py-4'>
            <GenericTable<CibleIndicateurStrategique>
              key={`cibles-istr-${indicateurCode}-${dataUpdatedAt}-${filteredCibles.length}`}
              data={filteredCibles}
              columns={columns}
              search={tableState.search}
              navigate={tableState.navigate}
              showSearch={false}
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
              emptyMessage='Aucune cible pour cet indicateur'
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={open && modal === 'form'} onOpenChange={(o) => !o && backToList()}>
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg' aria-describedby={undefined}>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {selectedCible ? 'Modifier la cible' : 'Ajouter une cible'}
            </DialogTitle>
          </DialogHeader>
          <div className='px-6 py-4'>
            <CibleIndicateurStrategiqueFormPanel
              indicateurCode={indicateurCode}
              cible={selectedCible}
              onClose={backToList}
              onSuccess={backToList}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
