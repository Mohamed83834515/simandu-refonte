import type { ReactNode } from 'react'
import type { ContratPerformance } from '@/simadou/allTypes/contratPerformance'
import type { ContratDetailTab, ContratDetailTabKey } from './contratDetailTabs'
import ContratOverviewPanel from './panels/ContratOverviewPanel'
import ContratResultsFrameworkPanel from './panels/ContratResultsFrameworkPanel'
import ContratIndicatorsPanel from './panels/ContratIndicatorsPanel'
import ContratFollowupPanel from './panels/ContratFollowupPanel'
import ContratReportPanel from './panels/ContratReportPanel'
import ContratSuiviReportPanel from './panels/ContratSuiviReportPanel'

const TAB_PANEL_RENDERERS: Record<ContratDetailTabKey, (contrat: ContratPerformance) => ReactNode> = {
  overview: (contrat) => <ContratOverviewPanel contrat={contrat} />,
  results_framework: (contrat) => <ContratResultsFrameworkPanel contrat={contrat} />,
  indicators: (contrat) => <ContratIndicatorsPanel contrat={contrat} />,
  followup: (contrat) => <ContratFollowupPanel contrat={contrat} />,
  report: (contrat) => <ContratReportPanel contrat={contrat} />,
  report_suivi: (contrat) => <ContratSuiviReportPanel contrat={contrat} />,
}

export default function ContratDetailPanel({ tab, contrat }: { tab: ContratDetailTab; contrat: ContratPerformance }) {
  const render = TAB_PANEL_RENDERERS[tab.key]
  return render ? render(contrat) : null
}
