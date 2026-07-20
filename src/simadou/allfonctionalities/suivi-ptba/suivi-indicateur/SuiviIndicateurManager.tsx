import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Ptba } from '@/simadou/allTypes'
import type { IndicateurTache } from '@/simadou/allTypes/indicateurTache'
import { getValeurCibleIndicateur } from '@/simadou/allColonnes/suivi-indicateur-columns'
import { useGetIndicateursByActivite } from '@/simadou/allHooks/admin/indicateurTacheHooks'
import { useGetAllSuivisIndicateurs } from '@/simadou/allHooks/admin/suiviPtbaHooks'
import ActiviteTabbedFormPanel from '../ActiviteTabbedFormPanel'
import {
  ActiviteTabbedSubViewHeader,
  useActiviteTabbedSubView,
} from '../ActiviteTabbedDialogContext'
import SuiviIndicateurActiviteTable from './SuiviIndicateurActiviteTable'
import SuiviIndicateurInlineManager from './SuiviIndicateurInlineManager'

type SuiviIndicateurManagerProps = {
  activite: Ptba
}

export default function SuiviIndicateurManager({
  activite,
}: SuiviIndicateurManagerProps) {
  const [selectedIndicateur, setSelectedIndicateur] =
    useState<IndicateurTache | null>(null)

  const showForm = selectedIndicateur != null
  useActiviteTabbedSubView(showForm, 'formWide')

  const { data: indicateurs = [], isLoading } = useGetIndicateursByActivite(
    activite.id_ptba
  )
  const { data: suivis = [] } = useGetAllSuivisIndicateurs(
    Number.isFinite(activite.id_ptba)
  )

  const handleSuivre = (indicateur: IndicateurTache) => {
    setSelectedIndicateur(indicateur)
  }

  const handleCloseForm = () => {
    setSelectedIndicateur(null)
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
      {showForm && selectedIndicateur ? (
        <ActiviteTabbedFormPanel
          header={
            <ActiviteTabbedSubViewHeader
              sectionLabel={buildSuiviIndicateurHeader(selectedIndicateur)}
              className='shrink-0 border-0 px-0 pb-0 text-base font-semibold text-foreground'
            />
          }
        >
          <SuiviIndicateurInlineManager
            key={selectedIndicateur.id_indicateur_tache}
            indicateur={selectedIndicateur}
            onClose={handleCloseForm}
          />
        </ActiviteTabbedFormPanel>
      ) : (
        <div className='min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 sm:py-3'>
          <SuiviIndicateurActiviteTable
            activite={activite}
            indicateurs={indicateurs}
            suivis={suivis}
            onSuivre={handleSuivre}
          />
        </div>
      )}
    </div>
  )
}

function buildSuiviIndicateurHeader(indicateur: IndicateurTache): string {
  const valeurCible = getValeurCibleIndicateur(indicateur)
  const base = `Suivi — ${indicateur.intitule_indicateur_tache}`
  return valeurCible ? `${base} · Valeur cible : ${valeurCible}` : base
}
