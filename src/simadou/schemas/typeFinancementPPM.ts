import { z } from 'zod'

export const typeFinancementPPMSchema = z.object({
  code_type_financement_ppm: z.string().min(1, 'Le code est obligatoire'),
  intitule_type_financement_ppm: z.string().min(1, "L'intitulé est obligatoire"),
})

export type TypeFinancementPPMFormData = z.infer<typeof typeFinancementPPMSchema>
