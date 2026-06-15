import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddZoneCollecte from '@/simadou/allfonctionalities/parametrage/zone-collecte/AddZoneCollecte'
import { ListeZoneCollecte } from '@/simadou/allfonctionalities/parametrage/zone-collecte/ListeZoneCollecte'
import { createFileRoute } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'

export const Route = createFileRoute(
  '/_authenticated/parametrage/zone-de-collecte/',
)({
  component: RouteComponent,
})


function RouteComponent() {
  return (
    <PageRouteLayout
      title='Zones de collecte'
      boutonAddTitle='Ajouter une zone'
      icon={MapPin}
      addDialogComponent={AddZoneCollecte}
      listComponent={ListeZoneCollecte}
    />
  )
}