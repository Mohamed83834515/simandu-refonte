import { z } from 'zod'

export const documentProjetSchema = z.object({
  document: z.any().optional(),
  description_document: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
})

export type DocumentProjetFormData = z.infer<typeof documentProjetSchema>
