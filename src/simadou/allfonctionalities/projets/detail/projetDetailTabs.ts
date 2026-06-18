import {
  Briefcase,
  ClipboardList,
  Eye,
  FileText,
  Layout,
  LayoutDashboard,
  OctagonAlert,
  type LucideIcon,
} from 'lucide-react'

export type ProjetDetailTabKey =
  | 'dashboard'
  | 'activities'
  | 'ptba'
  | 'suivi_ptba'
  | 'results_framework'
  | 'cmr_indicators'
  | 'documents'
  | 'points_blocage'

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
    name: 'Plan Analitique',
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
    key: 'results_framework',
    name: 'Cadre de résultats',
    icon: Layout,
    description: 'Structure du cadre de résultats et indicateurs associés.',
  },
  {
    key: 'cmr_indicators',
    name: 'Indicateurs CMR',
    icon: ClipboardList,
    description: 'Indicateurs du cadre de mesure des résultats.',
  },
  {
    key: 'documents',
    name: 'Documents',
    icon: FileText,
    description: 'Documents rattachés au projet.',
  },
  {
    key: 'points_blocage',
    name: 'Points de blocage',
    icon: OctagonAlert,
    description: 'Recommandations et missions de supervision du projet.',
  },
]
