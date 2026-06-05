import { z } from 'zod'
import { getFieldSchema } from '@/simadou/schemas/generalParams.schema'

export const identiteSchema = z.object({
  appName:          getFieldSchema('text', true),
  systemSigle:      getFieldSchema('text'),
  systemTitle:      getFieldSchema('text'),
  structureSigle:   getFieldSchema('text'),
  structureName:    getFieldSchema('text'),
  structureAddress: getFieldSchema('text'),
  primaryColor:     getFieldSchema('text'),
})

export type IdentiteInput = z.infer<typeof identiteSchema>