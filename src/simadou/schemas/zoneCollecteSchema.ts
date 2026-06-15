// simadou/schemas/zoneCollecteSchema.ts
import {  z } from 'zod'

export const zoneCollecteSchema = z.object({
  code_zone: z.string().min(1, 'Le code est requis'),
  nom_zone: z.string().min(1, 'Le nom est requis'),
  shape_file: z.union([
    z.instanceof(File),
    z.string().
      optional(),
  ]),
  type_zone: z.number().nullable().optional(),
})

export type ZoneCollecteFormData = z.infer<typeof zoneCollecteSchema>