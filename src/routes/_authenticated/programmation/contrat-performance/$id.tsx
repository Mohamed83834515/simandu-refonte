import ContratDetailPage from '@/simadou/allfonctionalities/programmation/contrat-performance/ContratDetailPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/programmation/contrat-performance/$id')({
  component: ContratDetailPage,
})
