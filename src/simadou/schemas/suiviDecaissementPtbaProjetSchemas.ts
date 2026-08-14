import { z } from 'zod'

export const suiviDecaissementPtbaProjetSchema = z.object({
  date_suivi_dec: z
    .string()
    .min(1, 'La date est requise')
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Format de date invalide',
    }),
  region: z.coerce
    .number()
    .int('La zone est requise')
    .positive('La zone est requise'),
  type_part: z.coerce
    .number()
    .int('Le financement est requis')
    .positive('Le financement est requis'),
  observation: z.string().min(1, "L'observation est requise").max(2000),
  montant_decaisse: z.coerce
    .number()
    .finite('Le montant doit être un nombre')
    .min(0, 'Le montant doit être positif ou nul'),
})

export type SuiviDecaissementPtbaProjetFormData = z.infer<
  typeof suiviDecaissementPtbaProjetSchema
>
