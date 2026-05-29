import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Layout,
  LayoutDashboard,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type ProjetDetailTabKey =
  | 'dashboard'
  | 'activities'
  | 'activity_indicators'
  | 'results_framework'
  | 'results_framework_indicators'
  | 'cmr_indicators'

export type ProjetDetailTab = {
  key: ProjetDetailTabKey
  name: string
  icon: LucideIcon
  description: string
}

export const projetDetailTabs: ProjetDetailTab[] = [
  {
    key: 'dashboard',
    name: "Vue d'ensemble",
    icon: LayoutDashboard,
    description: 'Synthèse du projet (indicateurs et avancement).',
  },
  {
    key: 'activities',
    name: 'Activités',
    icon: Briefcase,
    description: 'Liste et suivi des activités rattachées au projet.',
  },
  {
    key: 'activity_indicators',
    name: "Indicateurs d'activités",
    icon: Target,
    description: "Indicateurs de performance liés aux activités du projet.",
  },
  {
    key: 'results_framework',
    name: 'Cadre de résultats',
    icon: Layout,
    description: 'Structure du cadre de résultats du projet.',
  },
  {
    key: 'results_framework_indicators',
    name: 'Indicateurs de résultats',
    icon: BarChart3,
    description: 'Indicateurs associés au cadre de résultats.',
  },
  {
    key: 'cmr_indicators',
    name: 'Indicateurs CMR',
    icon: ClipboardList,
    description: 'Indicateurs du cadre de mesure des résultats.',
  },
]
