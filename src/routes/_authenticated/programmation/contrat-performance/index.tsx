import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddContratPerformance from '@/simadou/allfonctionalities/programmation/contrat-performance/AddContratPerformance'
import ListeContratPerformance from '@/simadou/allfonctionalities/programmation/contrat-performance/ListeContratPerformance'
import { createFileRoute } from '@tanstack/react-router'
import { FileSignature } from 'lucide-react'

export const Route = createFileRoute(
  '/_authenticated/programmation/contrat-performance/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Contrats de performance'
      icon={FileSignature}
      boutonAddTitle='Ajouter un contrat'
      addDialogComponent={AddContratPerformance}
      listComponent={ListeContratPerformance}
    />
  )
}