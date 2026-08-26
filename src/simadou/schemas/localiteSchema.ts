// simadou/schemas/localiteSchema.ts
import { z } from 'zod'

export const niveauLocaliteSchema = z.object({
  libelle_nlc: z.string().min(1, 'Le libellé est requis'),
  nombre_nlc: z.number().optional(),
  Code_number_nlc: z.number().min(1, 'La taille du code est requise'),
})

export const localiteSchema = z.object({
  intitule_loca: z.string().min(1, 'Le libellé est requis'),
  code_loca: z.string().min(1, 'Le code est requis'),
  code_national_loca: z.string().min(1, 'Le code national est requis'),
  parent_loca: z.number().nullable().optional(),
  niveau_loca: z.number(),
  latitude_loca: z.number().optional(),
  longitude_loca: z.number().optional(),
  shape_file: z.union([
    z.instanceof(File),
    z.string().
      optional(),
  ]),
})

export type NiveauLocaliteFormData = z.infer<typeof niveauLocaliteSchema>
export type LocaliteFormData = z.infer<typeof localiteSchema>