import ListePlanSite from '@/simadou/allfonctionalities/parametrage/plan-site/ListePlanSite'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute(
  '/_authenticated/parametrage/plans-de-site/',
)({
  component: ListePlanSite,
})