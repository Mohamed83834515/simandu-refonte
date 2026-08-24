import CartographieView from '@/simadou/allfonctionalities/cartographie/CartographieView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/suivi-resultats/cartographie/',
)({
  component: CartographieView,
})
