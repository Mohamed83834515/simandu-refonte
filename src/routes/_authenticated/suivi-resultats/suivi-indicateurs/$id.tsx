import { createFileRoute } from '@tanstack/react-router'
import SuiviIndicateurCmrPage from '@/simadou/allfonctionalities/suivi-resultats/suivi-indicateurs/SuiviIndicateurCmrPage'

export const Route = createFileRoute(
  '/_authenticated/suivi-resultats/suivi-indicateurs/$id'
)({
  component: SuiviIndicateurCmrPage,
})
