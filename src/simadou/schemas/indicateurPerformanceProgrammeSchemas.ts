import { z } from 'zod'

export const indicateurPerformanceProgrammeFormSchema = z.object({
  code_indicateur_performance: z.string().min(1, 'Le code est requis'),
  intitule_indicateur_tache: z.string().min(1, "L'intitulé est requis"),
  cadre_analytique: z.number().min(1, 'Le cadre analytique est requis'),
  unite_indicateur_performance: z.number().min(1, "L'unité est requise"),
  type_ind: z.union([z.literal(0), z.literal(1)], {
    error: 'Le type est requis',
  }),
  programme: z.number().min(1, 'Le programme est requis'),
})

export type IndicateurPerformanceProgrammeFormData = z.infer<
  typeof indicateurPerformanceProgrammeFormSchema
>
