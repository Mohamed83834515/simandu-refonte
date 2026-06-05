import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const financeSchema = z.object({
  currencyCode: getFieldSchema('text'),
  baseCurrency: getFieldSchema('text'),
  exchangeRate: getFieldSchema('number'),
})

export type FinanceInput = z.infer<typeof financeSchema>