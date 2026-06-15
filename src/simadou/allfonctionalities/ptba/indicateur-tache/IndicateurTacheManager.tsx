import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import {
  suiviPtbaQueryKeys,
  useGetIndicateursByActivite,
} from '@/simadou/allHooks/admin/indicateurTacheHooks'
import ActiviteTabbedFormPanel from '../ActiviteTabbedFormPanel'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '../ActiviteTabbedDialogContext'
import IndicateurTacheForm from './IndicateurTacheForm'
import IndicateurTacheList from './IndicateurTacheList'

type IndicateurTacheManagerProps = {
  activite: Ptba
}

export default function IndicateurTacheManager({
  activite,
}: IndicateurTacheManagerProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IndicateurTache | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data: indicateurs = [], isLoading } = useGetIndicateursByActivite(
    activite.id_ptba
  )

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: IndicateurTache) => {
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
      queryKey: suiviPtbaQueryKeys.indicateurs(activite.id_ptba),
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
                  ? `Modifier — ${editing.intitule_indicateur_tache}`
                  : 'Nouvel indicateur'
              }
              className='shrink-0 border-0 px-0 pb-0 text-sm font-semibold text-foreground'
            />
          }
        >
          <IndicateurTacheForm
            indicateur={editing}
            activite={activite}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
          <IndicateurTacheList
            indicateurs={indicateurs}
            idActivite={activite.id_ptba}
            onEdit={handleEdit}
            onAdd={handleAdd}
          />
        </div>
      )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm sm:px-4'>
          <div className='text-xs text-muted-foreground'>
            {indicateurs.length}{' '}
            {indicateurs.length === 1 ? 'indicateur' : 'indicateurs'}
          </div>
        </div>
      )}
    </div>
  )
}
