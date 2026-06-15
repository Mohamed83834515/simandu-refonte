import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import { ActiviteTabbedSubViewHeader, useActiviteTabbedSubView } from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'
import TacheActiviteProjetForm from './TacheActiviteForm'
import TacheActiviteProjetList from './TacheActiviteList'
import { useGetTachesByActiviteProjet, suiviPtbaQueryKeys } from '@/simadou/allHooks/admin/tacheActiviteProjetHooks'

type TacheActivitePtbaManagerProps = {
  activite: Ptba
}

export default function TacheActiviteProjetManager({
  activite,
}: TacheActivitePtbaManagerProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TacheActivitePtba | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data: taches = [], isLoading } = useGetTachesByActiviteProjet(
    activite.id_ptba
  )

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: TacheActivitePtba) => {
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
      queryKey: suiviPtbaQueryKeys.tachesActivite(activite.id_ptba),
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {showForm ? (
        <ActiviteTabbedFormPanel
          header={
            <ActiviteTabbedSubViewHeader
              sectionLabel={
                editing
                  ? `Modifier — ${editing.intutile_tache_gt}`
                  : 'Nouvelle tâche'
              }
              className='shrink-0 border-0 px-0 pb-0 text-sm font-semibold text-foreground'
            />
          }
        >
          <TacheActiviteProjetForm
            tache={editing}
            activite={activite}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
          <TacheActiviteProjetList
            taches={taches}
            idActivite={activite.id_ptba}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        </div>
      )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm sm:px-4'>
          <div className='text-xs text-muted-foreground'>
            {taches.length} {taches.length === 1 ? 'tâche' : 'tâches'}
          </div>
        </div>
      )}
    </div>
  )
}
