import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/simadou/allfonctionalities/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard, 
})
