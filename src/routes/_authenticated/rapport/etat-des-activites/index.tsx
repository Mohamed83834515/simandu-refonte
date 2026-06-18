import RapportEtatActivitesPage from '@/simadou/allfonctionalities/rapport/etat-des-activites/RapportEtatActivitesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/rapport/etat-des-activites/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <RapportEtatActivitesPage />
}
