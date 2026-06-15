import { z } from 'zod'

export const categorieActeurSchema = z.object({
  code_cat: z.string().min(1, 'Le code est requis'),
  nom_categorie: z.string().min(1, 'Le nom est requis'),
})

export type CategorieActeurFormData = z.infer<typeof categorieActeurSchema>