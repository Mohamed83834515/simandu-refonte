import { z } from 'zod'

const cibleSchema = z
  .string()
  .optional()

const indicateurContratBaseSchema = z.object({
  id_indicateur_contrat: z.number().optional(),
  intitule_indicateur: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  valeur_reference: z.coerce
    .number()
    .finite('La valeur de référence doit être un nombre'),
  cible_t1: cibleSchema,
  cible_t2: cibleSchema,
  cible_t3: cibleSchema,
  cible_t4: cibleSchema,
  etat: z.boolean().default(true),
  clcp: z.coerce
    .number()
    .int('Sélectionnez un cadre logique')
    .positive('Sélectionnez un cadre logique'),
  unite: z.coerce
    .number()
    .int("Sélectionnez une unité")
    .positive("Sélectionnez une unité"),
  id_personnel: z.number().optional(),
})

export const indicateurContratCreateSchema = indicateurContratBaseSchema.extend({
  moyen_verification: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),
})

export const indicateurContratUpdateSchema = indicateurContratBaseSchema.extend({
  moyen_verification: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),
})

export type IndicateurContratFormData =
  | z.infer<typeof indicateurContratCreateSchema>
  | z.infer<typeof indicateurContratUpdateSchema>
