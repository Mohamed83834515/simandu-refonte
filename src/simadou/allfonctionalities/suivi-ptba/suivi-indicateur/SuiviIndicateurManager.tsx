import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { ThemedPrimaryButton } from '@/Global/Generic/ThemedPrimaryButton'
import type {
  IndicateurActivitePtba,
  Ptba,
  SuiviIndicateurActivite,
} from '@/simadou/allTypes'
import {
  suiviPtbaQueryKeys,
  useGetAllSuivisIndicateurs,
  useGetIndicateursByActivite,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
import ActiviteTabbedFormPanel from '../ActiviteTabbedFormPanel'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '../ActiviteTabbedDialogContext'
import SuiviIndicateurForm from './SuiviIndicateurForm'
import SuiviIndicateurList from './SuiviIndicateurList'

type SuiviIndicateurManagerProps = {
  activite: Ptba
}

export default function SuiviIndicateurManager({
  activite,
}: SuiviIndicateurManagerProps) {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'list' | 'suivi-form'>('list')
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurActivitePtba | null>(null)
  const [editingSuivi, setEditingSuivi] =
    useState<SuiviIndicateurActivite | null>(null)

  useActiviteTabbedSubView(view === 'suivi-form')

  const { data: indicateurs = [], isLoading } = useGetIndicateursByActivite(
    activite.code_activite_ptba
  )
  const { data: suivis = [] } = useGetAllSuivisIndicateurs(
    !!activite.code_activite_ptba
  )

  const handleAddSuivi = (indicateur: IndicateurActivitePtba) => {
    setSelectedIndicateur(indicateur)
    setEditingSuivi(null)
    setView('suivi-form')
  }

  const handleEditSuivi = (suivi: SuiviIndicateurActivite) => {
    const codeIndicateur =
      typeof suivi.indicateur_activite === 'object' && suivi.indicateur_activite
        ? suivi.indicateur_activite.code_indicateur_activite
        : suivi.indicateur_activite

    const indicateur = indicateurs.find(
      (ind) => ind.code_indicateur_activite === codeIndicateur
    )

    if (indicateur) {
      setSelectedIndicateur(indicateur)
      setEditingSuivi(suivi)
      setView('suivi-form')
    }
  }

  const handleCloseSuiviForm = () => {
    setView('list')
    setSelectedIndicateur(null)
    setEditingSuivi(null)
  }

  const handleSuiviFormSuccess = () => {
    handleCloseSuiviForm()
    queryClient.invalidateQueries({
      queryKey: suiviPtbaQueryKeys.suivisIndicateurs,
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  if (view === 'suivi-form' && selectedIndicateur) {
    return (
      <ActiviteTabbedFormPanel
        header={
          <ActiviteTabbedSubViewHeader
            sectionLabel={`Suivi — ${selectedIndicateur.intitule_indicateur_tache}`}
            className='shrink-0 border-0 px-0 pb-0 text-sm font-semibold text-foreground'
          />
        }
      >
        <SuiviIndicateurForm
          indicateur={selectedIndicateur}
          suivi={editingSuivi}
          onClose={handleCloseSuiviForm}
          onSuccess={handleSuiviFormSuccess}
        />
      </ActiviteTabbedFormPanel>
    )
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
        {indicateurs.length === 0 ? (
          <div className='rounded-lg bg-muted/50 py-6 text-center text-muted-foreground'>
            <p className='text-sm font-medium'>Aucun indicateur pour cette activité</p>
            <p className='mt-1 text-xs'>
              Les indicateurs doivent être créés dans la section Programmation.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {indicateurs.map((indicateur) => (
              <div
                key={indicateur.id_indicateur_activite}
                className='space-y-2 rounded-lg border p-2 sm:p-3'
              >
                <div className='flex items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2'>
                  <div className='min-w-0 flex-1'>
                    <span className='text-sm font-medium'>
                      {indicateur.intitule_indicateur_tache}
                    </span>
                    <span className='ml-2 text-xs text-muted-foreground'>
                      (
                      {typeof indicateur.abrege_unite === 'object'
                        ? indicateur.abrege_unite?.unite_ui
                        : 'Unité'}
                      )
                    </span>
                  </div>
                  <ThemedPrimaryButton
                    onClick={() => handleAddSuivi(indicateur)}
                    icon={Plus}
                    className='h-8 shrink-0 px-3 text-sm'
                  >
                    Ajouter un suivi
                  </ThemedPrimaryButton>
                </div>

                <SuiviIndicateurList
                  suivis={suivis.filter(
                    (s) =>
                      (typeof s.indicateur_activite === 'string' &&
                        s.indicateur_activite ===
                          indicateur.code_indicateur_activite) ||
                      (typeof s.indicateur_activite === 'object' &&
                        s.indicateur_activite?.code_indicateur_activite ===
                          indicateur.code_indicateur_activite)
                  )}
                  onEdit={handleEditSuivi}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
