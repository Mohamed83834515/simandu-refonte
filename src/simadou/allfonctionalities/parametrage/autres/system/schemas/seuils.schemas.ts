import { z } from 'zod'

export const seuilSchema = z.object({
  ecartProjetCritique:     z.coerce.number().int().min(0).default(0),
  ecartProjetRetard:                z.coerce.number().int().min(0).default(0),
})

export type SeuilInput = z.infer<typeof seuilSchema>