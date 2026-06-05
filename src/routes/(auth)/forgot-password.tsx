import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/simadou/allfonctionalities/auth/forgot-password'
import { z } from 'zod'

const searchSchema = z.object({
  mode: z.enum(['setup', 'forgot']).optional(),
})
export const Route = createFileRoute('/(auth)/forgot-password')({
  validateSearch: (search) => {
    console.log('FORGOT ROUTE VALIDATE', search)
    return searchSchema.parse(search)
  },
  component: ForgotPassword,
})
