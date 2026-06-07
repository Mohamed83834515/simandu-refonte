import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Eye,
  Layout,
  LayoutDashboard,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type ProjetDetailTabKey =
  | 'dashboard'
  | 'activities'
  | 'ptba'
  | 'suivi_ptba'
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
    key: 'ptba',
    name: 'PTBA',
    icon: ClipboardList,
    description: 'Planification PTBA des activités du projet.',
  },
  {
    key: 'suivi_ptba',
    name: 'Suivi PTBA',
    icon: Eye,
    description: "Suivi d'avancement des activités PTBA du projet.",
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
