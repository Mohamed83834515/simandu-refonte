import RapportPtbaPage from '@/simadou/allfonctionalities/rapport/ptba'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/rapport/ptba/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RapportPtbaPage />
}
