import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddPpm from '@/simadou/allfonctionalities/ppm/ppms/AddPpm'
import ListePpm from '@/simadou/allfonctionalities/ppm/ppms/ListePpm'
import { PpmVersionProvider } from '@/simadou/allfonctionalities/ppm/ppms/PpmVersionContext'
import { createFileRoute } from '@tanstack/react-router'
import { FileStack } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/programmation/ppms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PpmVersionProvider>
      <PageRouteLayout
        title='PPMS'
        icon={FileStack}
        boutonAddTitle='Ajouter un PPM'
        addDialogComponent={AddPpm}
        listComponent={ListePpm}
      />
    </PpmVersionProvider>
  )
}
