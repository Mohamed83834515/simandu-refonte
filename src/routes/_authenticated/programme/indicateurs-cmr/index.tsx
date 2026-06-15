import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeIndicateursCmr from '@/simadou/allfonctionalities/politique/indicateurs-cmr/ListeIndicateursCmr'

export const Route = createFileRoute('/_authenticated/programme/indicateurs-cmr/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Indicateurs du CMR'
      icon={TrendingUp}
      showAddButton={false}
      listComponent={ListeIndicateursCmr}
    />
  )
}
