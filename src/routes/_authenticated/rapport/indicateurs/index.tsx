import RapportIndicateursPage from '@/simadou/allfonctionalities/rapport/indicateurs/RapportIndicateursPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/rapport/indicateurs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RapportIndicateursPage />
}
