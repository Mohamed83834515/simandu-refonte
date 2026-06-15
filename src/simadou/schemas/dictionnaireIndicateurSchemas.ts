import { z } from 'zod'

export const fonctionAgregatOptions = [
  'Somme',
  'Moyenne',
  'Minimum',
  'Maximum',
  'Comptage',
  'Médiane',
  'Ratio',
  'Pourcentage',
] as const

export const typologieOptions = [
  'Produit',
  'Effet',
  'Impact',
  'Valeur absolue',
  'Valeur relative',
  'Typologie quantitative',
  'Typologie qualitative',
] as const

/** IDs depuis les selects (valeurs string) ou champs number HTML. */
function requiredPositiveInt(message: string) {
  return z.coerce
    .number({
      error: (issue) =>
        issue.input === '' || issue.input === undefined || issue.input === null
          ? message
          : message,
    })
    .int()
    .positive(message)
}

function requiredNonNegativeNumber(message: string) {
  return z.coerce
    .number({
      error: (issue) =>
        issue.input === '' || issue.input === undefined || issue.input === null
          ? message
          : message,
    })
    .min(0, 'La valeur doit être positive ou nulle')
}

export const dictionnaireIndicateurWriteSchema = z.object({
  code_ref_ind: z.string().min(1, 'Le code est requis').max(50),
  intitule_ref_ind: z.string().min(1, "L'intitulé est requis").max(200),
  unite_cmr: requiredPositiveInt("L'unité est requise"),
  fonction_agregat_cmr: z
    .string()
    .min(1, "La fonction d'agrégation est requise")
    .max(100),
  echelle: requiredPositiveInt("L'échelle est requise"),
  typologie: z.string().min(1, 'La typologie est requise').max(50),
  seuil_minimum: requiredNonNegativeNumber('Le seuil minimum est requis'),
  seuil_maximum: requiredNonNegativeNumber('Le seuil maximum est requis'),
  responsable_collecte_cmr: requiredPositiveInt(
    'Le responsable de collecte est requis'
  ),
})

export type DictionnaireIndicateurWriteData = z.output<
  typeof dictionnaireIndicateurWriteSchema
>
