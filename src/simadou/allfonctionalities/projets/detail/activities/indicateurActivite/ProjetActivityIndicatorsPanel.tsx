import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import { ActiviteProjet } from '@/simadou/allTypes'
import { IndicateurPerformanceProjet } from '@/simadou/allTypes'
import { indicateurPerformanceProjetQueryKeys, useGetIndicateurPerformanceByActiviteProjet } from '@/simadou/allHooks/admin/indicateurPerformanceProjetHooks'
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
  // Si on est en mode formulaire, on affiche juste le formulaire
  if (showForm) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={DIALOG_SIZES.xl}>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier indicateur de performance' : 'Nouvel indicateur de performance'}
            </DialogTitle>
          </DialogHeader>

          <AddIndicateurPerformance
            currentRow={editing}
            activite={activite}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Sinon on affiche la liste
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_SIZES.xl}>
        <DialogHeader>
          <DialogTitle>
            Indicateurs de performance skhfws
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <ListeIndicateurPerformance
                indicateurs={indicateurs}
                idActivite={activite.code_activite_projet}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
            </div>

            <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm'>
              <div className='text-xs text-muted-foreground'>
                {indicateurs.length} {indicateurs.length === 1 ? 'indicateur' : 'indicateurs'}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}