import { z } from 'zod'
import { indicateurCmrCreateSchema } from './indicateursSchemas'

const requiredFkIdSchema = (message: string) =>
  z.preprocess(
    (value) => (value === '' || value == null || value === 0 ? undefined : value),
    z.coerce.number().min(1, message)
  )

export const indicateurCmrProjetCreateSchema = indicateurCmrCreateSchema.extend({
  indicateur_iop: requiredFkIdSchema("L'indicateur est requis"),
})

export const indicateurCmrProjetUpdateSchema =
  indicateurCmrProjetCreateSchema.partial()

export type IndicateurCmrProjetCreateData = z.infer<
  typeof indicateurCmrProjetCreateSchema
>

export type IndicateurCmrProjetUpdateData = z.infer<
  typeof indicateurCmrProjetUpdateSchema
>
