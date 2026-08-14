import { z } from 'zod'

export const niveauConfigClcpSchema = z.object({
  id_niveau_ncl: z.number(),
  code_number_ncl: z
    .string()
    .min(1, 'Le code est requis')
    .max(50, 'Le code ne peut pas dépasser 50 caractères'),
  nombre_ncl: z
    .number()
    .min(1, 'Le numéro de niveau est requis')
    .int('Le numéro de niveau doit être un entier'),
  etat: z.boolean(),
  contrat: z.number(),
  id_personnel: z.number(),
})

export const niveauConfigClcpCreateSchema = niveauConfigClcpSchema.omit({
  id_niveau_ncl: true,
})

export type NiveauConfigClcpCreateData = z.infer<
  typeof niveauConfigClcpCreateSchema
>

export const cadreLogiqueClcpSchema = z.object({
  id_clc: z.number(),
  code_clc: z.string().min(1, 'Le code est requis').max(50),
  niveau_clc: z.coerce.number().nullable().optional(),
  intitule_clc: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  etat: z.boolean(),
  contrat: z.number(),
  parent_clc: z.coerce.number().nullable().optional(),
  id_personnel: z.number().optional(),
})

export const cadreLogiqueClcpCreateSchema = cadreLogiqueClcpSchema.omit({
  id_clc: true,
})

export type CadreLogiqueClcpCreateData = z.infer<
  typeof cadreLogiqueClcpCreateSchema
>

export type CadreLogiqueClcpUpdateData = Partial<CadreLogiqueClcpCreateData>
