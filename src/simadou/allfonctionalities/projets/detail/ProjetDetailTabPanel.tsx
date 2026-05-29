import type { Projet } from '@/simadou/allTypes'
import type { ProjetDetailTab } from './projetDetailTabs'
import { renderProjetDetailTabPanel } from './projetDetailTabPanels'

type ProjetDetailTabPanelProps = {
  tab: ProjetDetailTab
  projet: Projet
}

export default function ProjetDetailTabPanel({
  tab,
  projet,
}: ProjetDetailTabPanelProps) {
  return renderProjetDetailTabPanel(tab, projet)
}
