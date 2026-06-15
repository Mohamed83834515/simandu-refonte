// simadou/schemas/acteurSchema.ts
import { z } from 'zod'

export const acteurSchema = z.object({
  code_acteur: z.string().min(1, 'Le code est requis'),
  nom_acteur: z.string().min(1, 'Le nom est requis'),
  description_acteur: z.string().optional(),
  personne_responsable: z.string().optional(),
  contact: z.string().optional(),
  adresse_email: z.string().email('Email invalide').optional().or(z.literal('')),
  categorie_acteur: z.number().nullable().optional(),
})

export type ActeurFormData = z.infer<typeof acteurSchema>