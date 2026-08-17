import { PageRouteLayout } from '@/Global/HookRoute/genericRoute'
import ListeSuiviPpm from '@/simadou/allfonctionalities/ppm/suivi-ppm/ListeSuiviPpm'
import { PpmVersionProvider } from '@/simadou/allfonctionalities/ppm/suivi-ppm/PpmVersionContext'
import { createFileRoute } from '@tanstack/react-router'
import { FileStack } from 'lucide-react'

export const Route = createFileRoute(
    '/_authenticated/suivi-resultats/suivi-ppm/',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <PpmVersionProvider>
            <PageRouteLayout
                title='Plan de Passation des Marchés'
                icon={FileStack}
                boutonAddTitle='Ajouter un marché'
                listComponent={ListeSuiviPpm}
            />
        </PpmVersionProvider>
    )
}
