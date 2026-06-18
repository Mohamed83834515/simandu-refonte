import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddProjet from '@/simadou/allfonctionalities/projets/AddProjet'
import ListeProjets from '@/simadou/allfonctionalities/projets/ListeProjets'
import TypeProjetDialog from '@/simadou/allfonctionalities/projets/type-projet/ModalType'
import { createFileRoute } from '@tanstack/react-router'
import { FolderOpen, GitBranch } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/projet-programme/projets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Gestion des projets'
      boutonAddTitle='Ajouter un projet'
      icon={FolderOpen}
      addDialogComponent={AddProjet}
      listComponent={ListeProjets}
      extraButtons={[
        {
          title: "Type de projet",
          icon: GitBranch,
          dialogComponent: TypeProjetDialog,
        },
      ]}
    />
  )
}
