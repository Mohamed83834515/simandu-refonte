import { z } from 'zod'

export const suiviIndicateurTacheProjetSchema = z.object({
  date_suivi_sit: z
    .string()
    .min(1, 'La date est requise')
    .refine((date) => !Number.isNaN(Date.parse(date)), {
      message: 'Format de date invalide',
    }),
  valeur_suivi_sit: z.coerce
    .number()
    .int('La valeur doit être un entier')
    .finite('La valeur doit être un nombre'),
  commune_sit: z.coerce
    .number()
    .int('Sélectionnez une commune')
    .positive('Sélectionnez une commune'),
})

export type SuiviIndicateurTacheProjetFormData = z.infer<
  typeof suiviIndicateurTacheProjetSchema
>

export type SuiviIndicateurTacheProjetPayload =
  SuiviIndicateurTacheProjetFormData & {
    indicateur_sit: number
  }

/** Même payload pour /suivis-indicateurs-taches/ (programme). */
export type SuiviIndicateurTachePayload = SuiviIndicateurTacheProjetPayload
