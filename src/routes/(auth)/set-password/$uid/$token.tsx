import { ResetPassword } from '@/simadou/allfonctionalities/auth/reset-password'

import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

export const passwordModeSchema = z.enum([
  'setup',
  'forgot',
  'reset',
])
const searchSchema = z.object({
  mode: passwordModeSchema.optional(),
})
export const Route = createFileRoute('/(auth)/set-password/$uid/$token')({
  validateSearch: (search) => {
    console.log('RESET ROUTE VALIDATE', search)
    return searchSchema.parse(search)
  },
  component: ResetPassword,
})

