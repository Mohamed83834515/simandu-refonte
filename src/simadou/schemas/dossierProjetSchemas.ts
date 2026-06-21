import { z } from 'zod'

export const dossierProjetSchema = z.object({
  nom_dossier: z
    .string()
    .min(1, 'Le nom du dossier est obligatoire')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description_dossier: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
})

export type DossierProjetFormData = z.infer<typeof dossierProjetSchema>
