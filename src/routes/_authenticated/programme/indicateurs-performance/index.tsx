import { createFileRoute } from '@tanstack/react-router'
import { LineChart } from 'lucide-react'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeIndicateursStrategique from '@/simadou/allfonctionalities/politique/indicateurs-strategique/ListeIndicateursStrategique'

export const Route = createFileRoute(
  '/_authenticated/programme/indicateurs-performance/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Indicateurs stratégiques'
      icon={LineChart}
      showAddButton={false}
      listComponent={ListeIndicateursStrategique}
    />
  )
}
