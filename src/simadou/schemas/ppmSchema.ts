import { z } from 'zod'

const fkField = (label: string) =>
  z.coerce
    .number({ message: `${label} est requis` })
    .int(`${label} doit être un entier`)
    .min(1, `${label} est requis`)

export const ppmSchema = z.object({
  intitule_ppm: z.string().min(1, "L'intitulé est obligatoire"),
  code_budget: z.coerce.number().int('Le code budget doit être un entier'),
  montant_budget: z.coerce
    .number()
    .min(0, 'Le montant doit être positif ou nul'),
  numero_appel_offre: z.coerce
    .number()
    .int("Le numéro d'appel d'offre doit être un entier"),
  methode_passation: fkField('La méthode de passation'),
  type_financement: fkField('Le type de financement'),
  version_ppm: fkField('La version PPM'),
  nature_marche: fkField('La nature de marché'),
})

/** Schéma affiché dans le formulaire (version injectée depuis la toolbar). */
export const ppmFormSchema = ppmSchema.omit({ version_ppm: true })

export type PpmFormData = z.infer<typeof ppmSchema>
export type PpmFormInput = z.infer<typeof ppmFormSchema>
