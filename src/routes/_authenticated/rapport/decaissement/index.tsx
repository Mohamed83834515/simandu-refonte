import RapportDecaissementPage from '@/simadou/allfonctionalities/rapport/decaissement/RapportDecaissementPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/rapport/decaissement/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RapportDecaissementPage />
}
