import { z } from 'zod'

export const securiteSchema = z.object({
  maintenanceMode:            z.boolean().default(false),
  inactivityDelayMinutes:     z.coerce.number().int().min(0).default(0),
  maxSessions:                z.coerce.number().int().min(0).default(0),
  loginAttemptsLimit:         z.coerce.number().int().min(0).default(0),
  tpCodeDelayMinutes:         z.coerce.number().int().min(0).default(0),
  passwordChangeDelayMonths:  z.coerce.number().int().min(0).default(0),
  deleteOrUpdateDelaySeconds: z.coerce.number().int().min(0).default(0),
})

export type SecuriteInput = z.infer<typeof securiteSchema>