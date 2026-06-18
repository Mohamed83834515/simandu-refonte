import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { IndicateurPerformanceProjet } from '@/simadou/allTypes'
import {
  useDeleteIndicateurPerformanceProjet,
  indicateurPerformanceProjetQueryKeys,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import IndicateurPerformanceActiviteTable from './IndicateurPerformanceActiviteTable'

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
  onAdd,
}: ListeIndicateurPerformanceProps) {
  const queryClient = useQueryClient()

  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] = useState<IndicateurPerformanceProjet | null>(null)

  const deleteMutation = useDeleteIndicateurPerformanceProjet()

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
      <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden'>
        <IndicateurPerformanceActiviteTable
        indicateurs={indicateurs}
        onEdit={onEdit}
        onDeleteRequest={(row) => {
          setCurrentRow(row)
          setDeleteOpen('delete')
        }}
        onAdd={onAdd}
        />
      </div>

      <GenericDeleteDialog<IndicateurPerformanceProjet>
        open={deleteOpen === 'delete'}
        onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
        currentRow={currentRow as IndicateurPerformanceProjet | null}
        entityName="l'indicateur"
        getEntityLabel={(row) => row?.intitule_indicateur_tache || ''}
        onDelete={handleConfirmDelete}
      />
    </>
  )
}
