import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { GenericDeleteDialog } from '@/Global/Tableaux/GenericDeleteDialog'
import useDialogState from '@/hooks/use-dialog-state'
import type { IndicateurPerformanceProgramme } from '@/simadou/allTypes'
import {
  indicateurPerformanceProgrammeQueryKeys,
  useDeleteIndicateurPerformanceProgramme,
} from '@/simadou/allHooks/admin/indicateurPerformanceProgrammeHooks'
import IndicateurPerformanceCadreAnalytiqueTable from './IndicateurPerformanceCadreAnalytiqueTable'

type ListeIndicateurPerformanceCadreAnalytiqueProps = {
  indicateurs: IndicateurPerformanceProgramme[]
  cadreAnalytiqueId: number
  programmeId: number
  onEdit: (row: IndicateurPerformanceProgramme) => void
  onAdd: () => void
}

export default function ListeIndicateurPerformanceCadreAnalytique({
  indicateurs,
  cadreAnalytiqueId,
  programmeId,
  onEdit,
  onAdd,
}: ListeIndicateurPerformanceCadreAnalytiqueProps) {
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useDialogState<'delete'>(null)
  const [currentRow, setCurrentRow] =
    useState<IndicateurPerformanceProgramme | null>(null)

  const deleteMutation = useDeleteIndicateurPerformanceProgramme(programmeId)

  const handleConfirmDelete = (row: IndicateurPerformanceProgramme) => {
    deleteMutation.mutate(row.id_indicateur_performance, {
      onSuccess: () => {
        toast.success('Indicateur supprimé avec succès')
        setCurrentRow(null)
        setDeleteOpen(null)
        queryClient.invalidateQueries({
          queryKey:
            indicateurPerformanceProgrammeQueryKeys.byCadre(cadreAnalytiqueId),
        })
      },
      onError: () => toast.error("Erreur lors de la suppression de l'indicateur"),
    })
  }

  return (
    <>
      <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden'>
        <IndicateurPerformanceCadreAnalytiqueTable
          indicateurs={indicateurs}
          onEdit={onEdit}
          onDeleteRequest={(row) => {
            setCurrentRow(row)
            setDeleteOpen('delete')
          }}
          onAdd={onAdd}
        />
      </div>

      <GenericDeleteDialog<IndicateurPerformanceProgramme>
        open={deleteOpen === 'delete'}
        onOpenChange={(isOpen) => setDeleteOpen(isOpen ? 'delete' : null)}
        currentRow={currentRow}
        entityName="l'indicateur"
        getEntityLabel={(row) => row?.intitule_indicateur_tache || ''}
        onDelete={handleConfirmDelete}
      />
    </>
  )
}
