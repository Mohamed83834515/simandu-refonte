import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const integrationsSchema = z.object({
  parentApiUrl: getFieldSchema('url'),
})

export type IntegrationsInput = z.infer<typeof integrationsSchema>