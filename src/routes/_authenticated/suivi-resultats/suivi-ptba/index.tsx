import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeSuiviPtba from '@/simadou/allfonctionalities/suivi-ptba/ListeSuiviPtba'
import { createFileRoute } from '@tanstack/react-router'
import { Eye } from 'lucide-react'

export const Route = createFileRoute(
  '/_authenticated/suivi-resultats/suivi-ptba/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title="Suivi du Plan d'Action Operationnel"
      icon={Eye}
      showAddButton={false}
      listComponent={ListeSuiviPtba}
    />
  )
}
