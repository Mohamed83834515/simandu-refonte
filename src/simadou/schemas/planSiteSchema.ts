import { z } from 'zod'

export const niveauPlanSiteSchema = z.object({
  libelle_nsc: z.string().min(1, 'Le libellé est requis'),
  code_number_nsc: z.number().min(1, 'La taille du code est requise'),
})

export type NiveauPlanSiteFormData = z.infer<typeof niveauPlanSiteSchema>


export const planSiteSchema = z.object({
  code_ds: z.string().min(1, 'Le code est requis'),
  code_relai_ds: z.string().min(1, 'Le code national est requis'),
  intutile_ds: z.string().min(1, 'Le libellé est requis'),
  parent_ds: z.number().nullable().optional(),
  niveau_ds: z.number(),
  niveau_structure: z.number(),
})

export type PlanSiteFormData = z.infer<typeof planSiteSchema>