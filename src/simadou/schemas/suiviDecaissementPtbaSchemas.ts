import { z } from 'zod'

export const suiviDecaissementPtbaSchema = z.object({
  date_suivi_dec: z
    .string()
    .min(1, 'La date est requise')
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Format de date invalide',
    }),
  observation: z.string().min(1, "L'observation est requise").max(200),
  montant_decaisse: z.coerce
    .number()
    .finite('Le montant doit être un nombre')
    .min(0, 'Le montant doit être positif ou nul'),
})

export type SuiviDecaissementPtbaFormData = z.infer<
  typeof suiviDecaissementPtbaSchema
>
