import { createFileRoute } from '@tanstack/react-router'
import { FileStack } from 'lucide-react'
import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeProgrammes from '@/simadou/allfonctionalities/politique/liste/ListeProgrammes'
import ProgrammeDialog from '@/simadou/allfonctionalities/politique/liste/ProgrammeDialog'

export const Route = createFileRoute('/_authenticated/programme/liste/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Liste des programmes'
      icon={FileStack}
      boutonAddTitle='Ajouter un programme'
      addDialogComponent={ProgrammeDialog}
      listComponent={ListeProgrammes}
    />
  )
}
