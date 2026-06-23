import { z } from 'zod'

export const TYPE_FINANCEMENT_VALUES = ['pret', 'don', 'contrepartie'] as const

export const financementProjetSchema = z.object({
  code_type: z
    .string()
    .min(1, 'Le code est requis')
    .max(50, 'Le code ne peut pas dépasser 50 caractères'),
  intitule: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  montant: z.coerce
    .number()
    .min(0, 'Le montant doit être positif ou nul'),
  date_accord: z.string().min(1, "La date d'accord est requise"),
  observation: z
    .string()
    .max(1000, "L'observation ne peut pas dépasser 1000 caractères")
    .optional(),
  type_financement: z.enum(TYPE_FINANCEMENT_VALUES, {
    message: 'Le type de financement est requis',
  }),
  bailleur: z.coerce.number().min(1, 'Le bailleur est requis'),
})

export type FinancementProjetFormData = z.infer<typeof financementProjetSchema>
