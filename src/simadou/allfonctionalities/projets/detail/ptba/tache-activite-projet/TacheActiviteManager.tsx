import { useState, useMemo, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { Ptba, TacheActivitePtba } from '@/simadou/allTypes'
import { DataTableToolbarOutlineButton } from '@/components/data-table/toolbar-outline-button'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
  useActiviteTabbedToolbarAction,
} from '@/simadou/allfonctionalities/ptba/ActiviteTabbedDialogContext'
import ActiviteTabbedFormPanel from '@/simadou/allfonctionalities/suivi-ptba/ActiviteTabbedFormPanel'
import {
  canAddTacheWithProportions,
  sumTacheProportions,
  TACHE_PROPORTION_TOTAL_MAX,
} from '@/simadou/lib/tacheActivitePtbaUtils'
import TacheActiviteProjetForm from './TacheActiviteForm'
import TacheActiviteProjetList from './TacheActiviteList'
import { useGetTachesByActiviteProjet } from '@/simadou/allHooks/admin/tacheActiviteProjetHooks'

type TacheActivitePtbaManagerProps = {
  activite: Ptba
}

const EMPTY_TACHES: TacheActivitePtba[] = []

export default function TacheActiviteProjetManager({
  activite,
}: TacheActivitePtbaManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TacheActivitePtba | undefined>()

  useActiviteTabbedSubView(showForm)

  const { data, isLoading } = useGetTachesByActiviteProjet(activite.id_ptba)
  const taches = data ?? EMPTY_TACHES

  const proportionTotal = useMemo(() => sumTacheProportions(taches), [taches])
  const canAdd = useMemo(() => canAddTacheWithProportions(taches), [taches])

  // Keeps `handleAdd` referentially stable: the toolbar action is pushed into
  // the dialog via an effect, so an unstable identity would loop renders.
  const canAddRef = useRef(canAdd)
  canAddRef.current = canAdd

  const handleAdd = useCallback(() => {
    if (!canAddRef.current) return
    setEditing(undefined)
    setShowForm(true)
  }, [])

  const toolbarAction = useMemo(
    () =>
      canAdd ? (
        <DataTableToolbarOutlineButton onClick={handleAdd}>
          Ajouter
        </DataTableToolbarOutlineButton>
      ) : null,
    [canAdd, handleAdd]
  )

  useActiviteTabbedToolbarAction('taches', toolbarAction, !showForm)

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
            existingTaches={taches}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto'>
          <TacheActiviteProjetList
            taches={taches}
            idActivite={activite.id_ptba}
            onEdit={handleEdit}
          />
        </div>
      )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-3 py-2 text-sm sm:px-4'>
          <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
            <span>
              {taches.length} {taches.length === 1 ? 'tâche' : 'tâches'}
            </span>
            <span>
              Proportion totale : {proportionTotal}% / {TACHE_PROPORTION_TOTAL_MAX}%
              {!canAdd ? ' — quota atteint' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
