import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddFonction from '@/simadou/allfonctionalities/parametrage/fonction/AddFonction'
import ListeFonction from '@/simadou/allfonctionalities/parametrage/fonction/ListeFonction'
import { createFileRoute } from '@tanstack/react-router'
import { Briefcase } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/parametrage/fonctions/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageRouteLayout
      title='Fonctions'
      icon={Briefcase}
      boutonAddTitle='Ajouter une fonction'
      addDialogComponent={AddFonction}
      listComponent={ListeFonction}
    />
  )
}
