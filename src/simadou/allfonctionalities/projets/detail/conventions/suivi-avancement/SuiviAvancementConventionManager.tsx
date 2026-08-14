import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Convention } from '@/simadou/allTypes/convention'
import type { SuiviAvancementConvention } from '@/simadou/allTypes/suiviAvancementConvention'
import {
  suiviConventionQueryKeys,
  useGetSuiviAvancementByConvention,
} from '@/simadou/allHooks/admin/suiviConventionHooks'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'
import SuiviAvancementConventionForm from './SuiviAvancementConventionForm'
import SuiviAvancementConventionList from './SuiviAvancementConventionList'

type Props = {
  convention: Convention
}

export default function SuiviAvancementConventionManager({ convention }: Props) {
  const queryClient = useQueryClient()
  const idConvention = convention.id_convention!
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SuiviAvancementConvention | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data: suivis = [], isLoading } =
    useGetSuiviAvancementByConvention(idConvention)

  const handleAdd = () => {
    setEditing(undefined)
    setShowForm(true)
  }

  const handleEdit = (row: SuiviAvancementConvention) => {
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
      queryKey: suiviConventionQueryKeys.avancement(idConvention),
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
              sectionLabel='Observation globale'
              className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
            />
          }
        >
          <SuiviAvancementConventionForm
            idConvention={idConvention}
            suivi={editing}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
          <SuiviAvancementConventionList
            suivis={suivis}
            idConvention={idConvention}
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
