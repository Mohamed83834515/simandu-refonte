


import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/parametrage/autres/')({
  beforeLoad: () => {
    throw redirect({ to: '/parametrage/autres/system' })
  },
})




