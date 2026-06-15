import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '@/simadou/authGuard'
import { AuthenticatedLayout } from '@/components/layout/others/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireAuth,
  component: AuthenticatedLayout,
})
