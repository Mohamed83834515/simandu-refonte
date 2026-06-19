import { createFileRoute } from '@tanstack/react-router'
import { LineChart } from 'lucide-react'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeIndicateursCmr from '@/simadou/allfonctionalities/politique/indicateurs-cmr/ListeIndicateursCmr'

function SuiviIndicateursList() {
  return <ListeIndicateursCmr showAddButton={false} showSuiviAction />
}

export const Route = createFileRoute(
  '/_authenticated/suivi-resultats/suivi-indicateurs/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Suivi des indicateurs'
      icon={LineChart}
      showAddButton={false}
      listComponent={SuiviIndicateursList}
    />
  )
}
