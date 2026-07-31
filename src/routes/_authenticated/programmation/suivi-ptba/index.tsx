import { createFileRoute, redirect } from '@tanstack/react-router'

/** Ancien chemin — redirige vers Suivi des résultats. */
export const Route = createFileRoute(
  '/_authenticated/programmation/suivi-ptba/',
)({
  beforeLoad: () => {
    throw redirect({ to: '/suivi-resultats/suivi-ptba' })
  },
})
