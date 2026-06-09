import type { ReactNode } from 'react'
import type { Projet } from '@/simadou/allTypes'
import type { ProjetDetailTab, ProjetDetailTabKey } from './projetDetailTabs'
import ProjetDashboard from './ProjetDashboard'
import ProjetActivitesPanel from './activities/ProjetActivitesPanel'
import ProjetActivityIndicatorsPanel from './activityIndicators/ProjetActivityIndicatorsPanel'
import ProjetPtbaPanel from './ptba/ProjetPtbaPanel'
import ProjetSuiviPtbaPanel from './suivi-ptba/ProjetSuiviPtbaPanel'
import ProjetCadreResultatsPanel from './resultsFramework/ProjetCadreResultatsPanel'
import ProjetIndicateursCmrPanel from './cmrIndicators/ProjetIndicateursCmrPanel'
import ProjetDetailPlaceholder from './ProjetDetailPlaceholder'


type TabPanelRenderer = (projet: Projet) => ReactNode

const TAB_PANEL_RENDERERS: Record<ProjetDetailTabKey, TabPanelRenderer> = {
  dashboard: () => <ProjetDashboard />,
  activities: (projet) => <ProjetActivitesPanel projet={projet} />,
  ptba: (projet) => <ProjetPtbaPanel projet={projet} />,
  suivi_ptba: (projet) => <ProjetSuiviPtbaPanel projet={projet} />,
  activity_indicators: (projet) => <ProjetActivityIndicatorsPanel projet={projet} />,
  results_framework: (projet) => <ProjetCadreResultatsPanel projet={projet} />,
  cmr_indicators: (projet) => <ProjetIndicateursCmrPanel projet={projet} />,
}

export function renderProjetDetailTabPanel(
  tab: ProjetDetailTab,
  projet: Projet
): ReactNode {
  const render = TAB_PANEL_RENDERERS[tab.key]
  if (render) return render(projet)
  return <ProjetDetailPlaceholder tab={tab} />
}
