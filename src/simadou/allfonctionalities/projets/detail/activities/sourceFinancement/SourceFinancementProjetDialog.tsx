import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DIALOG_SIZES } from '@/Global/Forms/dialog'
import ListeSourceFinancement from './ListeSourceFinancementProjet'
import AddSourceFinancement from './AddSourceFinancementProjet'
import { ActiviteProjet } from '@/simadou/allTypes'
import { SourFinancementProjet } from '@/simadou/allTypes/sourceFinancemanetProjet'
import {
  sourceFinancementQueryKeys,
  useGetSourcesByActivite,
} from '@/simadou/allHooks/admin/sourceFinancementProjetHooks'

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

  const { data, isLoading } = useGetSourcesByActivite(activite.id_activite_projet)

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
      queryKey: sourceFinancementQueryKeys.byActivite(activite.id_activite_projet),
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
          DIALOG_SIZES.xl,
          'flex flex-col gap-0 overflow-hidden p-0',
          showForm
            ? 'max-h-[min(90vh,36rem)]'
            : 'max-h-[min(90vh,42rem)]'
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4 pr-12'>
          <DialogTitle>
            {showForm
              ? editing
                ? 'Modifier la source de financement'
                : 'Nouvelle source de financement'
              : 'Sources de financement'}
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
              <AddSourceFinancement
                currentRow={editing}
                activite={activite}
                onClose={handleCloseForm}
                onSuccess={handleSuccess}
              />
            ) : (
              <ListeSourceFinancement
                sources={sources}
                idActivite={activite.id_activite_projet}
                onEdit={handleEdit}
                onAdd={handleAdd}
              />
            )}
          </div>
        )}

        {!showForm && !isLoading && (
          <div className='shrink-0 border-t bg-muted/40 px-6 py-3'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>
                  {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                </span>
                <span className='text-xs text-muted-foreground'>•</span>
                <span className='text-xs text-muted-foreground'>
                  {sources.filter((s) => Number(s.montant_source_financement) > 0).length}{' '}
                  avec montant
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-muted-foreground'>Total :</span>
                <span className='text-sm font-bold'>
                  {new Intl.NumberFormat('fr-FR').format(
                    sources.reduce(
                      (sum, source) => sum + (Number(source.montant_source_financement) || 0),
                      0
                    )
                  )}{' '}
                  GNF
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
