import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ActiviteProjet } from '@/simadou/allTypes'
import { IndicateurPerformanceProjet } from '@/simadou/allTypes'
import {
  indicateurPerformanceProjetQueryKeys,
  useGetIndicateurPerformanceByActiviteProjet,
} from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
import ListeIndicateurPerformance from './ListeIndicateurPerformanceActivite'
import AddIndicateurPerformance from './AddIndicateurPerformanceActivite'

type IndicateurPerformanceManagerProps = {
  activite: ActiviteProjet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function IndicateurPerformanceActiviteManager({
  activite,
  open,
  onOpenChange,
}: IndicateurPerformanceManagerProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IndicateurPerformanceProjet | undefined>()

  const { data, isLoading } = useGetIndicateurPerformanceByActiviteProjet(
    activite.code_activite_projet
  )

  const indicateurs = data ?? []

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: IndicateurPerformanceProjet) => {
    setEditing(row)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditing(undefined)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditing(undefined)
    queryClient.invalidateQueries({
      queryKey: indicateurPerformanceProjetQueryKeys.byActivite(activite.code_activite_projet),
    })
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
              <AddIndicateurPerformance
                currentRow={editing}
                activite={activite}
                onClose={handleCloseForm}
                onSuccess={handleSuccess}
              />
            ) : (
              <ListeIndicateurPerformance
                indicateurs={indicateurs}
                idActivite={activite.code_activite_projet}
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
