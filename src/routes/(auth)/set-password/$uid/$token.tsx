import { ResetPassword } from '@/simadou/allfonctionalities/auth/reset-password'
import { passwordModeSchema } from '@/simadou/allfonctionalities/auth/set-password/components/set-password-form'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

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

