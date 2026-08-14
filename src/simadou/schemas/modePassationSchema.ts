import { z } from 'zod'

export const modePassationSchema = z.object({
  code_mode_passation: z.string().min(1, 'Le code est obligatoire'),
  intitule_mode_passation: z.string().min(1, "L'intitulé est obligatoire"),
})

export type ModePassationFormData = z.infer<typeof modePassationSchema>
