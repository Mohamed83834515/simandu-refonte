import { createFileRoute } from '@tanstack/react-router'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import { Settings, Users } from 'lucide-react'
import ListeUtilisateurs from '@/simadou/allfonctionalities/parametrage/utilisateurs/ListeUtilisateurs'
import UtilisateurDialog from '@/simadou/allfonctionalities/parametrage/utilisateurs/UtilisateurDialog'
import GererTitresPersonnelDialog from '@/simadou/allfonctionalities/parametrage/utilisateurs/titres-personnel/GererTitresPersonnelDialog'

export const Route = createFileRoute(
  '/_authenticated/parametrage/utilisateurs/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Utilisateurs'
      icon={Users}
      boutonAddTitle='Ajouter un utilisateur'
      addDialogComponent={UtilisateurDialog}
      listComponent={ListeUtilisateurs}
      extraButtons={[
        {
          title: 'Gérer les titres',
          icon: Settings,
          dialogComponent: GererTitresPersonnelDialog,
        },
      ]}
    />
  )
}
