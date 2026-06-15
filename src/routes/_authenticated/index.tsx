import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/simadou/allfonctionalities/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardPage, 
})
