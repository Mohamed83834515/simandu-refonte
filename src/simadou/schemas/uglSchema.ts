// simadou/schemas/uglSchema.ts
import { z } from 'zod'

export const uglSchema = z.object({
  code_ugl: z.string().min(1, 'Le code est requis'),
  nom_ugl: z.string().min(1, 'Le nom est requis'),
  abrege_ugl: z.string().optional(),
  couleur_ugl: z.string().default('#000000'),
  chef_lieu_ugl: z.number().nullable().optional(),
  region_concerne_ugl: z.array(z.number()).default([]),
})

export type UGLFormData = z.infer<typeof uglSchema>