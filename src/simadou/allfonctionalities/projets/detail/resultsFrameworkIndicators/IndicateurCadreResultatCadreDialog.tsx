import { useCallback, useEffect, useMemo, useState } from 'react'
import { GenericTable } from '@/Global/Generic/Generictable'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import { buildIndicateurCadreResultatColumns } from '@/simadou/allColonnes/indicateur-cadre-resultat-columns'
import { useGetNiveauxCadreResultat } from '@/simadou/allHooks/admin/cadreResultatHooks'
import {
  useDeleteIndicateurCadreResultat,
  useGetIndicateursCadreResultat,
} from '@/simadou/allHooks/admin/indicateurCadreResultatHooks'
import type { CadreResultat, IndicateurCadreResultat } from '@/simadou/allTypes'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import IndicateurCadreResultatFormDialog from './IndicateurCadreResultatFormDialog'
import {
  filterIndicateursForCadreResultat,
  resolveFixedCodeCrFromCadre,
  resolveNiveauCrLabel,
  resolveNiveauIopFromCadre,
} from './indicateurCadreResultatFormUtils'

type Modal = 'list' | 'form'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cadre: CadreResultat | null
  codeProjet: string
  idProjet: number
}

export default function IndicateurCadreResultatCadreDialog({
  open,
  onOpenChange,
  cadre,
  codeProjet,
  idProjet,
}: Props) {
  const { data: allIndicateurs = [], dataUpdatedAt } =
    useGetIndicateursCadreResultat()
  const { data: niveaux = [] } = useGetNiveauxCadreResultat(idProjet)
  const deleteMutation = useDeleteIndicateurCadreResultat()
  const tableState = useEmbeddedTableState()

  const [modal, setModal] = useState<Modal>('list')
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurCadreResultat | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [rowToDelete, setRowToDelete] =
    useState<IndicateurCadreResultat | null>(null)

  const fixedCadreCrCode = useMemo(
    () => (cadre ? resolveFixedCodeCrFromCadre(cadre) : null),
    [cadre]
  )

  const fixedNiveauIop = useMemo(
    () => (cadre ? resolveNiveauIopFromCadre(cadre, niveaux) : null),
    [cadre, niveaux]
  )

  const niveauLabel = useMemo(
    () => (cadre ? resolveNiveauCrLabel(cadre, niveaux) : null),
    [cadre, niveaux]
  )

  const filteredIndicateurs = useMemo(() => {
    if (!cadre) return []
    return filterIndicateursForCadreResultat(allIndicateurs, cadre, codeProjet)
  }, [allIndicateurs, cadre, codeProjet])

  useEffect(() => {
    if (!open) {
      setModal('list')
      setSelectedIndicateur(null)
    }
  }, [open])

  const backToList = () => {
    setModal('list')
    setSelectedIndicateur(null)
  }

  const handleEdit = useCallback((row: IndicateurCadreResultat) => {
    setSelectedIndicateur(row)
    setModal('form')
  }, [])

  const handleDeleteRequest = useCallback(
    (row: IndicateurCadreResultat) => {
      setRowToDelete(row)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )


  const columns = useMemo(
    () =>
      buildIndicateurCadreResultatColumns({
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
        hideCadreColumn: true,
      }),
    [handleEdit, handleDeleteRequest]
  )

  const handleConfirmDelete = (row: IndicateurCadreResultat) => {
    deleteMutation.mutate(row.id_indicateur_cr_iop, {
      onSuccess: () => {
        toast.success('Indicateur supprimé')
        setRowToDelete(null)
        setDeleteOpen(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  if (!cadre) return null

  return (
    <>
      {rowToDelete && (
        <GenericDeleteDialog<IndicateurCadreResultat>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={rowToDelete}
          entityName="l'indicateur de résultat"
          getEntityLabel={(row) => row.intitule_indicateur_cr_iop}
          onDelete={handleConfirmDelete}
        />
      )}

      <Dialog open={open && modal === 'list'} onOpenChange={onOpenChange}>
        <DialogContent
          className='gap-0 overflow-hidden p-0 sm:max-w-4xl'
          aria-describedby={undefined}
        >
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>Indicateurs de résultats</DialogTitle>
            <DialogDescription>
              {cadre.code_cr} — {cadre.intutile_cr}
              {niveauLabel ? ` · Niveau ${niveauLabel}` : ''}
              {` · Projet ${codeProjet}`}
            </DialogDescription>
          </DialogHeader>

          <div className='max-w-full overflow-x-auto px-6 py-4'>
            <GenericTable<IndicateurCadreResultat>
              key={`indicateurs-cr-cadre-${cadre.id_cr}-${dataUpdatedAt}-${filteredIndicateurs.length}`}
              data={filteredIndicateurs}
              columns={columns}
              search={tableState.search}
              navigate={tableState.navigate}
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
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='ms-auto h-8'
                  onClick={() => {
                    setSelectedIndicateur(null)
                    setModal('form')
                  }}
                >
                  <Plus className='h-4 w-4' />
                  Ajouter un indicateur
                </Button>
              }
              emptyMessage='Aucun indicateur pour ce cadre'
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open && modal === 'form'}
        onOpenChange={(o) => !o && backToList()}
      >
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-3xl'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {selectedIndicateur
                ? "Modifier l'indicateur de résultat"
                : 'Nouvel indicateur de résultat'}
            </DialogTitle>
            <DialogDescription>
              Cadre : {cadre.code_cr} — {cadre.intutile_cr}
              {niveauLabel ? ` · Niveau ${niveauLabel}` : ''}
              {` · Projet ${codeProjet}`}
            </DialogDescription>
          </DialogHeader>
          <div className='px-6 py-4'>
            <IndicateurCadreResultatFormDialog
              key={
                selectedIndicateur?.id_indicateur_cr_iop ??
                `new-${cadre.id_cr}-${fixedNiveauIop ?? 'niveau'}`
              }
              codeProjet={codeProjet}
              idProjet={idProjet}
              fixedCadreCrCode={fixedCadreCrCode}
              fixedNiveauIop={fixedNiveauIop}
              indicateur={selectedIndicateur}
              onClose={backToList}
              onSuccess={backToList}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
