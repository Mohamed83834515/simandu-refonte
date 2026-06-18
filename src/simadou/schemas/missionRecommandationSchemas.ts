import { z } from 'zod'
export const missionSupervisionProjetSchema = z.object({
  code_ms: z
    .string()
    .min(1, 'Le code est requis')
    .max(50, 'Le code ne peut pas dépasser 50 caractères'),
  type_mission: z
    .string()
    .max(100, 'Le type ne peut pas dépasser 100 caractères')
    .optional(),
  objet: z.string().optional(),
  resume: z.string().optional(),
  debut: z.string().min(1, 'La date de début est requise'),
  fin: z.string().min(1, 'La date de fin est requise'),
  observation: z.string().optional(),
  projection: z.string().optional(),
  etat: z.string().optional(),
  // document: z.union([z.instanceof(File), z.string()]).optional(),
})

export type MissionSupervisionProjetFormData = z.infer<
  typeof missionSupervisionProjetSchema
>

export const typeMissionSupervisionOptions = [
  {
    value: "0",
    label: "Comité de pilotage"
  },
  {
    value: "1",
    label: "Supervision"
  },
  {
    value: "2",
    label: "Appui ponctuel"
  },
  {
    value: "3",
    label: "Suivi ministriel"
  },
  {
    value: "4",
    label: "Audit"
  },
]

export const recommandationMissionProjetSchema = z.object({
  volet_recommandation: z
    .string()
    .max(200, 'Le volet ne peut pas dépasser 200 caractères')
    .optional(),
  rubrique: z
    .string()
    .max(200, 'La rubrique ne peut pas dépasser 200 caractères')
    .optional(),
  numero: z
    .string()
    .max(50, 'Le numéro ne peut pas dépasser 50 caractères')
    .optional(),
  ref_no: z
    .string()
    .max(50, 'La référence ne peut pas dépasser 50 caractères')
    .optional(),
  date_buttoir: z
    .string()
    .min(1, 'La date butoir est requise')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  recommandation: z.string().optional(),
  type_recommandation: z
    .string()
    .max(100, 'Le type ne peut pas dépasser 100 caractères')
    .optional(),
  observation: z.string().optional(),
  rapport: z.union([z.instanceof(File), z.string()]).optional(),
  etat: z.string().optional(),
  mission: z.coerce
    .number({
      message: 'Sélectionnez une mission de supervision',
    })
    .min(1, 'Sélectionnez une mission de supervision'),
  responsable: z.coerce.number().optional(),
  responsable_interne: z.coerce.number().optional(),
  structure: z.coerce.number().optional(),
})

export const typeMissionRecommandationOptions = [
  {
    value: "a_echeance",
    label: "Comité de pilotage"
  },
  {
    value: "1",
    label: "Supervision"
  },
  {
    value: "2",
    label: "Appui ponctuel"
  },
  {
    value: "3",
    label: "Suivi ministriel"
  },
  {
    value: "4",
    label: "Audit"
  },
]

export type RecommandationMissionProjetFormData = z.infer<
  typeof recommandationMissionProjetSchema
>
