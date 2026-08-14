import { createFileRoute } from '@tanstack/react-router'
import ProjetDetail from '@/simadou/allfonctionalities/projets/detail/ProjetDetail'

export const Route = createFileRoute(
  '/_authenticated/projet-programme/projets/$id/'
)({
  component: ProjetDetail,
})
