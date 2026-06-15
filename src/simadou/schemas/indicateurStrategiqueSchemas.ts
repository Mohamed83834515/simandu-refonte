import { z } from 'zod'

const optionalString = z.preprocess(
  (val) => (val == null || val === '' ? null : String(val)),
  z.string().nullable().optional()
)

export const indicateurStrategiqueWriteSchema = z.object({
  code_indicateur_istr: z.string().min(1, 'Le code est obligatoire'),
  intitule_indicateur_istr: z.string().min(1, "L'intitulé est obligatoire"),
  code_istr: z.coerce.string().min(1, 'Le cadre stratégique est obligatoire'),
  periodicite_iop: optionalString,
  source_istr: optionalString,
  responsable_istr: z.coerce.string().min(1, 'Le responsable est obligatoire'),
  description_istr: z.string().min(1, 'La description est obligatoire'),
  structure_istr: optionalString,
  niveau_istr: z.coerce.number().optional(),
  programme_istr: z.coerce.string().nullable().optional(),
})

export type IndicateurStrategiqueWriteData = z.infer<
  typeof indicateurStrategiqueWriteSchema
>

export const cibleIndicateurStrategiqueWriteSchema = z.object({
  annee: z.string().min(1, "L'année est obligatoire"),
  code_ug: z.string().min(1, "L'unité de gestion est obligatoire"),
  valeur_cible_indcateur_istr: z.coerce
    .number()
    .min(0, 'La valeur cible doit être positive'),
})

export type CibleIndicateurStrategiqueWriteData = z.infer<
  typeof cibleIndicateurStrategiqueWriteSchema
>

export type CibleIndicateurStrategiquePayload = CibleIndicateurStrategiqueWriteData & {
  code_indicateur_istr: string
  code_programme?: string
}
