import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { CadreAnalytique } from '@/simadou/allTypes'
import { invalidateAndRefetch } from '@/simadou/allHooks/admin/queryInvalidation'
import { cibleIndicateurPerformanceProgrammeQueryKeys } from '@/simadou/allHooks/admin/cibleIndicateurPerformanceProgrammeHooks'
import {
  indicateurPerformanceProgrammeQueryKeys,
  useGetIndicateursPerformanceByCadreAnalytique,
} from '@/simadou/allHooks/admin/indicateurPerformanceProgrammeHooks'
import type { IndicateurPerformanceProgramme } from '@/simadou/allTypes/indicateurPerformanceProgramme'
import ListeIndicateurPerformanceCadreAnalytique from './ListeIndicateurPerformanceCadreAnalytique'
import AddIndicateurPerformanceCadreAnalytique from './AddIndicateurPerformanceCadreAnalytique'

type CadreAnalytiqueIndicateursDialogProps = {
  cadre: CadreAnalytique
  programmeId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CadreAnalytiqueIndicateursDialog({
  cadre,
  programmeId,
  open,
  onOpenChange,
}: CadreAnalytiqueIndicateursDialogProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IndicateurPerformanceProgramme | undefined>()

  const { data: indicateurs = [], isLoading } =
    useGetIndicateursPerformanceByCadreAnalytique(cadre, programmeId)

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: IndicateurPerformanceProgramme) => {
    setEditing(row)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(undefined)
  }

  const handleSuccess = async () => {
    await Promise.all([
      invalidateAndRefetch(
        queryClient,
        indicateurPerformanceProgrammeQueryKeys.byCadre(cadre.id_ca)
      ),
      invalidateAndRefetch(
        queryClient,
        indicateurPerformanceProgrammeQueryKeys.all
      ),
      invalidateAndRefetch(
        queryClient,
        cibleIndicateurPerformanceProgrammeQueryKeys.byProgramme(programmeId)
      ),
    ])
    setShowForm(false)
    setEditing(undefined)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setShowForm(false)
      setEditing(undefined)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl',
          showForm
            ? 'max-h-[min(90vh,40rem)]'
            : 'max-h-[min(90vh,42rem)]'
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4 pr-12'>
          <DialogTitle>
            {showForm
              ? editing
                ? 'Modifier un indicateur'
                : 'Ajouter un indicateur'
              : 'Indicateurs de performance'}
          </DialogTitle>
          {!showForm ? (
            <p className='text-sm text-muted-foreground'>
              {cadre.code_ca} — {cadre.intutile_ca}
            </p>
          ) : null}
        </DialogHeader>

        {isLoading && !showForm ? (
          <div className='flex flex-1 items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col px-6 py-4',
              showForm ? 'overflow-y-auto' : 'overflow-hidden'
            )}
          >
            {showForm ? (
              <AddIndicateurPerformanceCadreAnalytique
                currentRow={editing}
                cadre={cadre}
                programmeId={programmeId}
                onClose={handleCloseForm}
                onSuccess={handleSuccess}
              />
            ) : (
              <ListeIndicateurPerformanceCadreAnalytique
                indicateurs={indicateurs}
                cadreAnalytiqueId={cadre.id_ca}
                programmeId={programmeId}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
            )}
          </div>
        )}

        {!showForm && !isLoading && (
          <div className='shrink-0 border-t bg-muted/40 px-6 py-3'>
            <p className='text-xs text-muted-foreground'>
              {indicateurs.length}{' '}
              {indicateurs.length === 1 ? 'indicateur' : 'indicateurs'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
