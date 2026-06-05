import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const securiteSchema = z.object({
  maintenanceMode:            z.boolean().default(false),
  inactivityDelayMinutes:     getFieldSchema('number'),
  maxSessions:                getFieldSchema('number'),
  loginAttemptsLimit:         getFieldSchema('number'),
  tpCodeDelayMinutes:         getFieldSchema('number'),
  passwordChangeDelayMonths:  getFieldSchema('number'),
  deleteOrUpdateDelaySeconds: getFieldSchema('number'),
})

export type SecuriteInput = z.infer<typeof securiteSchema>