import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/programmation/parametrage-marches/',
)({
  beforeLoad: () => {
    throw redirect({ to: '/programmation/parametrage-marches/versions-ppm' })
  },
})
