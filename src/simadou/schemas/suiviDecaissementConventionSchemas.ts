import { z } from 'zod'

export const documentFichierSchema = z.union([
  z.instanceof(File),
  z.string().min(1),
])

export const suiviDecaissementConventionSchema = z.object({
  date_suivi_dec: z
    .string()
    .min(1, 'La date est requise')
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Format de date invalide',
    }),
  montant_decaisse: z.coerce
    .number()
    .finite('Le montant doit être un nombre')
    .min(0, 'Le montant doit être positif ou nul'),
  observation: z.string().min(1, "L'observation est requise").max(2000),
  document_fichier: documentFichierSchema.optional().nullable(),
})

export type SuiviDecaissementConventionFormData = z.infer<
  typeof suiviDecaissementConventionSchema
>
