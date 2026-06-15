import { z } from 'zod'

export const suiviTacheActiviteProjetSchema = z.object({
  date_reele: z
    .string()
    .min(1, 'La date est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  observation_suivi: z.string().max(2000),
  proportion_realisee: z
    .number()
    .min(0, 'Min. 0')
    .max(100, 'Max. 100'),
  valide: z.boolean(),
})

export type SuiviTacheActiviteProjetFormData = z.output<
  typeof suiviTacheActiviteProjetSchema
>

export type SuiviTacheActiviteProjetPayload = SuiviTacheActiviteProjetFormData & {
  id_activite_ptba: number
  id_groupe_tache: number
}
