// simadou/schemas/uniteIndicateurSchema.ts
import { z } from 'zod'

export const uniteIndicateurSchema = z.object({
  unite_ui: z.string().min(1, 'L\'unité est requise'),
  definition_ui: z.string().min(1, 'La définition est requise'),
})

export type UniteIndicateurFormData = z.infer<typeof uniteIndicateurSchema>