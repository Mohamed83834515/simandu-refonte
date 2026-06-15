import { z } from 'zod'

export const identiteSchema = z.object({
  systemSigle:      z.string().optional(),
  systemTitle:      z.string().optional(),
  structureSigle:   z.string().optional(),
  structureName:    z.string().optional(),
  structureAddress: z.string().optional(),
})

export type IdentiteInput = z.infer<typeof identiteSchema>