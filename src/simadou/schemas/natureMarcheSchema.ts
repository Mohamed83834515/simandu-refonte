import { z } from 'zod'

export const natureMarcheSchema = z.object({
  code_nature_marche: z.string().min(1, 'Le code est obligatoire'),
  intitule_nature_marche: z.string().min(1, "L'intitulé est obligatoire"),
})

export type NatureMarcheFormData = z.infer<typeof natureMarcheSchema>
