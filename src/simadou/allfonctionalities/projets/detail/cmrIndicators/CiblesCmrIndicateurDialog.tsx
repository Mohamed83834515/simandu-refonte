import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import type { CibleCmrProjet, IndicateurCmr } from '@/simadou/allTypes'
import { buildCibleCmrProjetColumns } from '@/simadou/allColonnes/cible-cmr-projet-columns'
import {
  useDeleteCibleCmrProjet,
  useGetAllCiblesCmrProjet,
} from '@/simadou/allHooks/admin/indicateurCmrHooks'
import { useGetIndicateursCadreResultat } from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import { uglService } from '@/simadou/allSercices/uglService'
import {
  formatAnneeCible,
  formatValeurCible,
} from '@/simadou/schemas/cibleCmrProjetSchema'
import CibleCmrProjetDetailView from './CibleCmrProjetDetailView'
import CibleCmrProjetFormDialog from './CibleCmrProjetFormDialog'
import {
  filterCiblesForIndicateurCmr,
  resolveFixedCodeIndicateurCrpFromCmr,
} from './cmrIndicateurFormUtils'

type Modal = 'list' | 'form' | 'view'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicateur: IndicateurCmr | null
  codeProjet: string
}

export default function CiblesCmrIndicateurDialog({
  open,
  onOpenChange,
  indicateur,
  codeProjet,
}: Props) {
  const { data: allCibles = [], dataUpdatedAt } = useGetAllCiblesCmrProjet()
  const { data: indicateursCadreResultat = [] } = useGetIndicateursCadreResultat()
  const { data: ugls = [] } = useQuery({
    queryKey: ['ugls'],
    queryFn: () => uglService.getAll(),
  })
  const deleteMutation = useDeleteCibleCmrProjet()
  const tableState = useEmbeddedTableState()

  const [modal, setModal] = useState<Modal>('list')
  const [selectedCible, setSelectedCible] = useState<CibleCmrProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [cibleToDelete, setCibleToDelete] = useState<CibleCmrProjet | null>(null)

  const fixedCodeIndicateurCrp = useMemo(
    () => (indicateur ? resolveFixedCodeIndicateurCrpFromCmr(indicateur) : null),
    [indicateur]
  )

  const filteredCibles = useMemo(() => {
    if (!indicateur) return []
    return filterCiblesForIndicateurCmr(
      allCibles,
      indicateur,
      indicateursCadreResultat,
      codeProjet
    )
  }, [allCibles, indicateur, indicateursCadreResultat, codeProjet])

  useEffect(() => {
    if (!open) {
      setModal('list')
      setSelectedCible(null)
    }
  }, [open])

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
        hideIndicateurColumn: true,
        hideProjetColumn: true,
        indicateurs: indicateursCadreResultat,
        ugls,
      }),
    [
      handleView,
      handleEdit,
      handleDeleteRequest,
      indicateursCadreResultat,
      ugls,
    ]
  )

  const handleConfirmDelete = (cible: CibleCmrProjet) => {
    deleteMutation.mutate(cible.id_cible_indicateur_crp, {
      onSuccess: () => {
        toast.success('Cible CMR projet supprimée')
        setCibleToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  if (!indicateur) return null

  return (
    <>
      {cibleToDelete && (
        <GenericDeleteDialog<CibleCmrProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={cibleToDelete}
          entityName='la cible CMR projet'
          getEntityLabel={(row) =>
            `cible ${formatAnneeCible(row.annee)} (${formatValeurCible(Number(row.valeur_cible_indcateur_crp ?? 0))})`
          }
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open && modal === 'list'} onOpenChange={onOpenChange}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-4xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Cibles CMR</DialogTitle>
            <DialogDescription>
              {indicateur.code_ref_ind} — {indicateur.intitule_ref_ind}
              {` · Projet ${codeProjet}`}
            </DialogDescription>
          </DialogHeader>

          <div className='px-6 py-4'>
            <GenericTable<CibleCmrProjet>
              key={`cibles-cmr-ind-${indicateur.id_ref_ind_cmr}-${dataUpdatedAt}-${filteredCibles.length}`}
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

      <Dialog open={open && modal === 'view'} onOpenChange={(o) => !o && backToList()}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-lg'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Détails de la cible CMR projet</DialogTitle>
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
            <DialogDescription>
              Indicateur : {indicateur.code_ref_ind} — {indicateur.intitule_ref_ind}
              {` · Projet ${codeProjet}`}
            </DialogDescription>
          </DialogHeader>
          <CibleCmrProjetFormDialog
            key={selectedCible?.id_cible_indicateur_crp ?? `new-${indicateur.id_ref_ind_cmr}`}
            codeProjet={codeProjet}
            cible={selectedCible}
            fixedIndicateurCrpId={fixedCodeIndicateurCrp}
            onClose={backToList}
            onSuccess={backToList}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
