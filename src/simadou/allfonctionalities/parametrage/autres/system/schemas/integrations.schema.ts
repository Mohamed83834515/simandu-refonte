import { z } from 'zod'

export const integrationsSchema = z.object({
  parentApiUrl:            z.string().nullable().optional(),
  parentApiKey:            z.string().nullable().optional(),
  parentApiSecret:         z.string().nullable().optional(),
  parentApiTimeoutSeconds: z.coerce.number().int().min(0).optional(),
  whatsappApiKey:          z.string().nullable().optional(),
})

export type IntegrationsInput = z.infer<typeof integrationsSchema>