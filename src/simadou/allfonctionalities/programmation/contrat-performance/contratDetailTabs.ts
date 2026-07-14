import {
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Target,
  type LucideIcon,
} from 'lucide-react'

export type ContratDetailTabKey =
  | 'overview'
  | 'results_framework'
  | 'indicators'
  | 'followup'
  | 'report'

export type ContratDetailTab = {
  key: ContratDetailTabKey
  name: string
  icon: LucideIcon
  description: string
}

export const contratDetailTabs: ContratDetailTab[] = [
  {
    key: 'overview',
    name: "Vue d'ensemble",
    icon: LayoutDashboard,
    description: 'Informations générales et résumé du contrat.',
  },
  {
    key: 'results_framework',
    name: 'Cadre de résultat',
    icon: Target,
    description: 'Cadre de résultats et objectifs associés au contrat.',
  },
  {
    key: 'indicators',
    name: 'Indicateurs de résultats',
    icon: ClipboardList,
    description: 'Indicateurs et cibles de performance.',
  },
  {
    key: 'report',
    name: 'Rapport',
    icon: FileBarChart,
    description: 'Cadre logique du contrat, exportable en Word, Excel et PDF.',
  },
//   {
//     key: 'followup',
//     name: 'Suivi indicateur',
//     icon: FileText,
//     description: 'Historique et suivi des indicateurs.',
//   },
]
