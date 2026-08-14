import { z } from 'zod'

export const STATUT_ACTIVITE_VALUES = [
  'en cours',
  'en attente',
  'réalisé',
] as const

export const statutActiviteOptions = [
  { value: 'en cours', label: 'En cours' },
  { value: 'en attente', label: 'En attente' },
  { value: 'réalisé', label: 'Réalisé' },
] as const

export const documentFichierSchema = z.union([
  z.instanceof(File),
  z.string().min(1),
])

export const suiviAvancementConventionSchema = z.object({
  date_suivi: z
    .string()
    .min(1, 'La date est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD')
    .refine(
      (date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const selectedDate = new Date(date)
        selectedDate.setHours(0, 0, 0, 0)
        return selectedDate <= today
      },
      {
        message:
          "La date de suivi ne peut pas être dans le futur. Veuillez sélectionner une date antérieure ou égale à aujourd'hui.",
      }
    ),
  statut_activite: z.enum(STATUT_ACTIVITE_VALUES, {
    message: "Sélectionnez un statut d'activité",
  }),
  etat_avancement: z
    .string()
    .min(1, "L'état d'avancement est requis")
    .max(2000),
  difficultes_rencontrees: z
    .string()
    .min(1, 'Les difficultés rencontrées sont requises')
    .max(2000),
  pistes_solutions: z
    .string()
    .min(1, 'Les pistes de solutions sont requises')
    .max(2000),
  observation: z.string().min(1, "L'observation est requise").max(2000),
  documents_fichiers: z.array(documentFichierSchema).default([]),
})

export type SuiviAvancementConventionFormData = z.output<
  typeof suiviAvancementConventionSchema
>
