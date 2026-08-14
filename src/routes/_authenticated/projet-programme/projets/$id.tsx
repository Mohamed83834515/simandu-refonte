import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/projet-programme/projets/$id'
)({
  component: () => <Outlet />,
})
