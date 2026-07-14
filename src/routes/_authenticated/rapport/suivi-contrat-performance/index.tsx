import RapportSuiviContratPage from '@/simadou/allfonctionalities/rapport/contrat-performance/RapportSuiviContratPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/rapport/suivi-contrat-performance/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <RapportSuiviContratPage />
}
