import { z } from 'zod'
import { indicateurCmrCreateSchema } from './indicateursSchemas'

const requiredFkIdSchema = (message: string) =>
  z.preprocess(
    (value) => (value === '' || value == null || value === 0 ? undefined : value),
    z.coerce.number().min(1, message)
  )

export const indicateurCmrProgrammeCreateSchema =
  indicateurCmrCreateSchema.extend({
    indicateur_istr: requiredFkIdSchema("L'indicateur stratégique est requis"),
  })

export type IndicateurCmrProgrammeCreateData = z.infer<
  typeof indicateurCmrProgrammeCreateSchema
>
