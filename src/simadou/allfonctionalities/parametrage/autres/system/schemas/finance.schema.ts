import { z } from 'zod'

export const financeSchema = z.object({
  currencyCode: z.string().optional(),
  baseCurrency: z.string().optional(),
  exchangeRate: z.coerce.number().min(0).optional(),
})

export type FinanceInput = z.infer<typeof financeSchema>