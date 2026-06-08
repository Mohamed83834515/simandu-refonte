import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Ptba, SuiviAvancementContrat } from '@/simadou/allTypes'
import {
  suiviPtbaQueryKeys,
  useGetSuiviAvancementByActivite,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import SuiviAvancementContratForm from './SuiviAvancementContratForm'
import SuiviAvancementContratList from './SuiviAvancementContratList'
import { ActiviteTabbedSubViewHeader, useActiviteTabbedSubView } from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'

type SuiviAvancementContratManagerProps = {
  activite: Ptba
}

export default function SuiviAvancementContratProjetManager({
  activite,
}: SuiviAvancementContratManagerProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SuiviAvancementContrat | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data: suivis = [], isLoading } = useGetSuiviAvancementByActivite(
    activite.id_ptba
  )

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: SuiviAvancementContrat) => {
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
      queryKey: suiviPtbaQueryKeys.suiviAvancement(activite.id_ptba),
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
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
                sectionLabel="Observation globale sur l'activité"
                className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
              />
            }
          >
            <SuiviAvancementContratForm
              suivi={editing}
              activite={activite}
              onClose={handleCloseForm}
              onSuccess={handleSuccess}
            />
          </ActiviteTabbedFormPanel>
        ) : (
          <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
            <SuiviAvancementContratList
              suivis={suivis}
              idActivite={activite.id_ptba}
              onEdit={handleEdit}
              onAdd={handleAdd}
            />
          </div>
        )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:px-4'>
          {suivis.length} observation(s) globale(s)
        </div>
      )}
    </div>
  )
}
