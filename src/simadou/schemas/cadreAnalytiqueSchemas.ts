import { z } from 'zod'

/** FK optionnelle — null/vide/0 ne doivent jamais devenir une sélection implicite. */
const optionalRelationId = z.preprocess(
  (val) => {
    if (val == null || val === '') return null
    const n = Number(val)
    return Number.isFinite(n) && n > 0 ? n : null
  },
  z.number().nullable().optional()
)

export const cadreAnalytiqueWriteSchema = z.object({
  code_ca: z.string().min(1, 'Le code est obligatoire'),
  intutile_ca: z.string().min(1, "L'intitulé est obligatoire"),
  abgrege_ca: z.string().optional().default(''),
  cout_axe: z.coerce.number().min(0, 'Le coût doit être positif'),
  parent_ca: optionalRelationId,
  partenaire_ca: z.array(z.coerce.number()).optional().default([]),
  niveau_ca: z.coerce.number().optional(),
  programme_ca: z.coerce.number().nullable().optional(),
})

export type CadreAnalytiqueWriteData = z.infer<typeof cadreAnalytiqueWriteSchema>

export const niveauCadreAnalytiqueWriteSchema = z.object({
  libelle_nca: z.string().min(1, 'Le libellé est obligatoire'),
  nombre_nca: z.coerce.number().min(1, 'La taille du code doit être au moins 1'),
  code_number_nca: z.coerce.number().min(1, 'Le numéro de niveau est obligatoire'),
  programme: z.string().optional(),
})

export type NiveauCadreAnalytiqueWriteData = z.infer<
  typeof niveauCadreAnalytiqueWriteSchema
>
