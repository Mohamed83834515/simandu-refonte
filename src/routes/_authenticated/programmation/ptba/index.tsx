import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddPtba from '@/simadou/allfonctionalities/ptba/AddPtba'
import ListePtbas from '@/simadou/allfonctionalities/ptba/ListePtba'
import TypeActiviteDialog from '@/simadou/allfonctionalities/ptba/type-activite/ModalTypeActivite'
import VersionPtbaDialog from '@/simadou/allfonctionalities/ptba/version-ptba/VersionPtbaDialog'
import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList, GitBranch, Layers3 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/programmation/ptba/')({
  component: RouteComponent,
})
function RouteComponent() {
  return (
    <PageRouteLayout
      title="Listes activités du Plan d'Action Operationnel"
      boutonAddTitle="Ajouter PAO"
      icon={ClipboardList}
      addDialogComponent={AddPtba}
      listComponent={ListePtbas}
      extraButtons={[
        {
          title: "Versions",
          icon: GitBranch,
          dialogComponent: VersionPtbaDialog,
        },
        {
          title: "Types activité",
          icon: Layers3,
          dialogComponent: TypeActiviteDialog,
        },
      ]}
    />
  )
}
