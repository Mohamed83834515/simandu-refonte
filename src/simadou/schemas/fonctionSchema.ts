// simadou/schemas/fonctionSchema.ts
import { z } from 'zod'

export const fonctionSchema = z.object({
  nom_fonction: z.string().min(1, 'Le nom de la fonction est requis'),
  description_fonction: z.string().min(1, 'La description est requise'),
})

export type FonctionFormData = z.infer<typeof fonctionSchema>