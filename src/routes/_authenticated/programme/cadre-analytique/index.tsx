import { createFileRoute } from '@tanstack/react-router'
import { BarChart2, Layers3 } from 'lucide-react'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeCadreAnalytique from '@/simadou/allfonctionalities/politique/cadre-analytique/ListeCadreAnalytique'
import NiveauCadreAnalytiqueDialog from '@/simadou/allfonctionalities/politique/cadre-analytique/NiveauCadreAnalytiqueDialog'

export const Route = createFileRoute('/_authenticated/programme/cadre-analytique/')({
  component: RouteComponent,
})

function RouteComponent() {
  const ListComponent = ListeCadreAnalytique

  return (
    <PageRouteLayout
      title='Cadre analytique'
      icon={BarChart2}
      showAddButton={false}
      listComponent={ListComponent}
      extraButtons={[
        {
          title: 'Gestion des niveaux',
          icon: Layers3,
          dialogComponent: NiveauCadreAnalytiqueDialog,
        },
      ]}
    />
  )
}
