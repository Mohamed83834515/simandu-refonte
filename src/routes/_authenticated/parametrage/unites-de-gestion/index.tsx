import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import AddUgl from '@/simadou/allfonctionalities/parametrage/ugl/AddUgl'
import { ListeUgl } from '@/simadou/allfonctionalities/parametrage/ugl/ListeUgl'
import { createFileRoute } from '@tanstack/react-router'
import { LayoutGrid } from 'lucide-react'

export const Route = createFileRoute(
    '/_authenticated/parametrage/unites-de-gestion/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PageRouteLayout
            title='Unités de gestion'
            icon={LayoutGrid}
            boutonAddTitle='Ajouter une unité de gestion'
            addDialogComponent={AddUgl}
            listComponent={ListeUgl}
        />
    )
}