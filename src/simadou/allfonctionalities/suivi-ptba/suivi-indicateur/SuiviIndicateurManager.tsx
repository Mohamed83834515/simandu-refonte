import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Ptba } from '@/simadou/allTypes'
import { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { useGetIndicateursByActivite } from '@/simadou/allHooks/admin/indicateurTacheHooks'
import {
  useGetAllSuivisIndicateurs,
} from '@/simadou/allHooks/admin/suiviPtbaHooks'
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
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurTache | null>(null)
  const [showSuiviDialog, setShowSuiviDialog] = useState(false)

  const { data: indicateurs = [], isLoading } = useGetIndicateursByActivite(
    activite.id_ptba
  )
  const { data: suivis = [] } = useGetAllSuivisIndicateurs(
    Number.isFinite(activite.id_ptba)
  )

  const handleSuivre = (indicateur: IndicateurTache) => {
    setSelectedIndicateur(indicateur)
    setShowSuiviDialog(true)
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
      <div className='space-y-4 p-4'>
        <ActiviteTabbedSubViewHeader sectionLabel='Suivi des indicateurs' />
        <SuiviIndicateurForm
          indicateur={selectedIndicateur}
          suivi={editingSuivi}
          onClose={handleCloseSuiviForm}
          onSuccess={handleSuiviFormSuccess}
        />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='border-b px-4 py-3'>
        <span className='text-lg font-semibold'>Suivi des indicateurs</span>
      </div>

      <div className='space-y-4 p-4'>
        {indicateurs.length === 0 ? (
          <div className='rounded-lg bg-muted/50 py-8 text-center text-muted-foreground'>
            <p className='font-medium'>Aucun indicateur pour cette activité</p>
            <p className='mt-2 text-sm'>
              Les indicateurs doivent être créés dans la section Programmation.
            </p>
          </div>
        ) : (
          indicateurs.map((indicateur) => (
            <div
              key={indicateur.id_indicateur_activite}
              className='space-y-2 rounded-lg border p-3'
            >
              <div className='flex items-center justify-between gap-2 rounded-md bg-muted/60 px-4 py-2'>
                <div className='min-w-0 flex-1'>
                  <span className='font-medium'>
                    {indicateur.intitule_indicateur_tache}
                  </span>
                  <span className='ml-2 text-sm text-muted-foreground'>
                    (
                    {typeof indicateur.abrege_unite === 'object'
                      ? indicateur.abrege_unite?.unite_ui
                      : 'Unité'}
                    )
                  </span>
                  <span className='ml-2 text-xs text-muted-foreground'>
                    Code: {indicateur.code_indicateur_activite}
                  </span>
                </div>
                <ThemedPrimaryButton
                  onClick={() => handleAddSuivi(indicateur)}
                  icon={Plus}
                  className='h-8 px-3 text-sm'
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
          ))
        )}
      </div>
    </div>
  )
}
