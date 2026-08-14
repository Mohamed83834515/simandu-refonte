import { useCallback, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GenericTable } from '@/Global/Generic/Generictable'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import { useEmbeddedTableState } from '@/hooks/use-embedded-table-state'
import type { Projet } from '@/simadou/allTypes'
import type { FinancementProjet } from '@/simadou/allTypes/financementProjet'
import { buildFinancementProjetColumns } from '@/simadou/allColonnes/financement-projet-columns'
import {
  useDeleteFinancementProjet,
  useGetFinancementsProjet,
} from '@/simadou/allHooks/admin/financementProjetHooks'
import FinancementProjetFormDialog from './FinancementProjetFormDialog'

type ProjetFinancementPanelProps = {
  projet: Projet
}

export default function ProjetFinancementPanel({
  projet,
}: ProjetFinancementPanelProps) {
  const idProjet = projet.id_projet
  const { search, navigate } = useEmbeddedTableState()
  const { data: financements = [], isLoading } =
    useGetFinancementsProjet(idProjet)
  const deleteMutation = useDeleteFinancementProjet(idProjet)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedFinancement, setSelectedFinancement] =
    useState<FinancementProjet | null>(null)
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [financementToDelete, setFinancementToDelete] =
    useState<FinancementProjet | null>(null)

  const signatairesById = useMemo(
    () =>
      new Map(
        (projet.signataires_projet ?? []).map((acteur) => [
          acteur.id_acteur,
          acteur,
        ])
      ),
    [projet.signataires_projet]
  )

  const handleAdd = () => {
    setSelectedFinancement(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((row: FinancementProjet) => {
    setSelectedFinancement(row)
    setFormOpen(true)
  }, [])

  const handleDeleteRequest = useCallback(
    (row: FinancementProjet) => {
      setFinancementToDelete(row)
      setDeleteOpen('delete')
    },
    [setDeleteOpen]
  )

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedFinancement(null)
  }

  const columns = useMemo(
    () =>
      buildFinancementProjetColumns({
        signatairesById,
        onEdit: handleEdit,
        onDeleteRequest: handleDeleteRequest,
      }),
    [signatairesById, handleEdit, handleDeleteRequest]
  )

  const handleConfirmDelete = (row: FinancementProjet) => {
    deleteMutation.mutate(row.id_part, {
      onSuccess: () => {
        setFinancementToDelete(null)
        setDeleteOpen(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          Gestion des financements du projet.
        </p>
        <Button type='button' onClick={handleAdd}>
          <Plus className='h-4 w-4' />
          Ajouter
        </Button>
      </div>

      <GenericTable<FinancementProjet>
        data={financements}
        columns={columns}
        search={search}
        navigate={navigate}
        searchKey='intitule'
        searchPlaceholder='Filtrer les financements…'
        urlFilterConfig={[
          {
            columnId: 'intitule',
            searchKey: 'intitule',
            type: 'string',
          },
          {
            columnId: 'code_type',
            searchKey: 'code_type',
            type: 'string',
          },
        ]}
        showViewOptions={false}
        defaultPageSize={10}
        compactPagination
        emptyMessage='Aucun financement pour ce projet.'
      />

      <Dialog open={formOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className={DIALOG_SIZES.md}>
          <DialogHeader>
            <DialogTitle>
              {selectedFinancement
                ? 'Modifier le financement'
                : 'Ajouter un financement'}
            </DialogTitle>
            <DialogDescription>
              {selectedFinancement
                ? 'Modifiez les informations du financement.'
                : 'Renseignez les informations du nouveau financement.'}
            </DialogDescription>
          </DialogHeader>
          <FinancementProjetFormDialog
            projet={projet}
            financement={selectedFinancement}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {financementToDelete && (
        <GenericDeleteDialog<FinancementProjet>
          open={deleteOpen === 'delete'}
          onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
          currentRow={financementToDelete}
          entityName='le financement'
          getEntityLabel={(row) =>
            row.intitule?.trim() || row.code_type?.trim() || 'Financement'
          }
          onDelete={handleConfirmDelete}
        />
      )}
    </div>
  )
}
