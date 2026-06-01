import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import type { Ptba, SuiviTacheActivite, TacheActivitePtba } from '@/simadou/allTypes'
import { tacheBelongsToActivite } from '@/simadou/allTypes/tacheActivitePtba'
import {
  filterSuivisForTaches,
  tauxAvancementGlobalTaches,
} from '@/simadou/allTypes/suiviTacheActivite'
import {
  suiviPtbaQueryKeys,
  useGetSuiviTachesByActivite,
  useGetTachesByActivite,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import ActiviteTabbedFormPanel from '../ActiviteTabbedFormPanel'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '../ActiviteTabbedDialogContext'
import TacheAvancementProgressBar from '../TacheAvancementProgressBar'
import SuiviTacheActiviteForm from './SuiviTacheActiviteForm'
import SuiviTacheActiviteList from './SuiviTacheActiviteList'

type SuiviTacheActiviteManagerProps = {
  activite: Ptba
}

export default function SuiviTacheActiviteManager({
  activite,
}: SuiviTacheActiviteManagerProps) {
  const queryClient = useQueryClient()
  const [selectedTache, setSelectedTache] = useState<TacheActivitePtba | null>(
    null
  )
  const [editingSuivi, setEditingSuivi] = useState<
    SuiviTacheActivite | undefined
  >()

  const showForm = selectedTache != null
  useActiviteTabbedSubView(showForm)

  const { data: suivis = [], isLoading: suivisLoading } =
    useGetSuiviTachesByActivite(activite.id_ptba)
  const { data: taches = [], isLoading: tachesLoading } = useGetTachesByActivite(
    activite.id_ptba
  )

  const filteredTaches = useMemo(
    () => taches.filter((t) => tacheBelongsToActivite(t, activite)),
    [taches, activite]
  )

  const suivisForTaches = useMemo(
    () => filterSuivisForTaches(suivis, filteredTaches),
    [suivis, filteredTaches]
  )

  const tauxAvancementGlobal = useMemo(
    () => tauxAvancementGlobalTaches(filteredTaches, suivisForTaches),
    [filteredTaches, suivisForTaches]
  )

  const handleSuivre = (
    tache: TacheActivitePtba,
    suivi?: SuiviTacheActivite
  ) => {
    setSelectedTache(tache)
    setEditingSuivi(suivi)
  }

  const handleCloseForm = () => {
    setSelectedTache(null)
    setEditingSuivi(undefined)
  }

  const handleSuccess = () => {
    handleCloseForm()
    queryClient.invalidateQueries({
      queryKey: suiviPtbaQueryKeys.suiviTache(activite.id_ptba),
    })
    queryClient.invalidateQueries({ queryKey: suiviPtbaQueryKeys.tachesAll })
  }

  const isLoading = suivisLoading || tachesLoading

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        {showForm && selectedTache ? (
          <ActiviteTabbedFormPanel
            maxWidth='lg'
            header={
              <ActiviteTabbedSubViewHeader
                sectionLabel={`Suivi — ${selectedTache.intutile_tache_gt}`}
                className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
              />
            }
          >
            <SuiviTacheActiviteForm
              tache={selectedTache}
              suivi={editingSuivi}
              idActivite={activite.id_ptba}
              onClose={handleCloseForm}
              onSuccess={handleSuccess}
            />
          </ActiviteTabbedFormPanel>
        ) : (
          <div className='min-h-0 flex-1 overflow-y-auto px-6 py-5'>
            <SuiviTacheActiviteList
              taches={filteredTaches}
              suivis={suivisForTaches}
              onSuivre={handleSuivre}
            />
          </div>
        )}

      {!showForm && (
        <div className='shrink-0 border-t bg-muted/40 px-6 py-4 text-sm'>
          <div className='flex flex-wrap items-center justify-between gap-6'>
            <TacheAvancementProgressBar percent={tauxAvancementGlobal} />
            {filteredTaches.length > 0 && (
              <div className='shrink-0 text-xs text-muted-foreground'>
                {filteredTaches.length}{' '}
                {filteredTaches.length === 1 ? 'tâche' : 'tâches'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
