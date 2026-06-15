import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import { ListePartenaireFinancier } from '@/simadou/allfonctionalities/parametrage/partenaire-financier/ListePartenaireFinancier'
import { createFileRoute } from '@tanstack/react-router'
import { UserStar } from 'lucide-react'

export const Route = createFileRoute(
  '/_authenticated/parametrage/partenaire-financier/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Unités de gestion'
      icon={UserStar}
      boutonAddTitle='Ajouter une unité de gestion'
      listComponent={ListePartenaireFinancier}
    />
  )
}