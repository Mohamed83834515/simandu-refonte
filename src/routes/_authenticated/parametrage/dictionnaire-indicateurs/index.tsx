import { createFileRoute } from '@tanstack/react-router'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import { BookOpen } from 'lucide-react'
import ListeDictionnaireIndicateurs from '@/simadou/allfonctionalities/parametrage/dictionnaire-indicateurs/ListeDictionnaireIndicateurs'
import DictionnaireIndicateurDialog from '@/simadou/allfonctionalities/parametrage/dictionnaire-indicateurs/DictionnaireIndicateurDialog'

export const Route = createFileRoute(
  '/_authenticated/parametrage/dictionnaire-indicateurs/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Dictionnaire des indicateurs'
      icon={BookOpen}
      boutonAddTitle='Ajouter un indicateur'
      addDialogComponent={DictionnaireIndicateurDialog}
      listComponent={ListeDictionnaireIndicateurs}
    />
  )
}
