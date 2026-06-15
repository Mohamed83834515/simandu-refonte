import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DIALOG_SIZES } from "@/Global/Forms/dialog"
import ListeSourceFinancement from "./ListeSourceFinancementProjet"
import AddSourceFinancement from "./AddSourceFinancementProjet"
import { ActiviteProjet } from '@/simadou/allTypes'
import { SourFinancementProjet } from '@/simadou/allTypes/sourceFinancemanetProjet'
import { sourceFinancementQueryKeys, useGetSourcesByActivite } from '@/simadou/allHooks/admin/sourceFinancementProjetHooks'

type SourceFinancementManagerProps = {
  activite: ActiviteProjet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SourceFinancementManager({
  activite,
  open,
  onOpenChange,
}: SourceFinancementManagerProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SourFinancementProjet | undefined>()

  const { data, isLoading } = useGetSourcesByActivite(
    activite.code_activite_projet
  )
  
  const sources = data?.sourceFinancement ?? []

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: SourFinancementProjet) => {
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
      queryKey: sourceFinancementQueryKeys.byActivite(activite.code_activite_projet),
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
              {editing ? 'Modifier la source de financement' : 'Nouvelle source de financement'}
            </DialogTitle>
          </DialogHeader>
          
          <AddSourceFinancement
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
            Sources de financement
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <ListeSourceFinancement
                sources={sources}
                idActivite={activite.code_activite_projet}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
            </div>

            <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm'>
              <div className='text-xs text-muted-foreground'>
                {sources.length} {sources.length === 1 ? 'source' : 'sources'} de financement
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}