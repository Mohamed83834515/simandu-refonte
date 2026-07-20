import { z } from 'zod'

export const contratPerformanceSchema = z.object({
  code_contrat: z.string().min(1, 'Le code du contrat est requis'),
  intitule_contrat: z.string().min(1, "L'intitulé du contrat est requis"),
  signataire_ministere: z.string().min(1, 'Le signataire est requis'),
  date_signature: z.string().min(1, 'La date de signature est requise'),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().min(1, 'La date de fin est requise'),
  statut: z.enum(['brouillon', 'en_cours', 'valide', 'termine', 'archive']).default('en_cours'),
  note_globale: z.number().optional().default(0),
  appreciation: z.string().optional().default(''),
  observation_globale: z.string().optional().default(''),
  etat: z.string().optional().default('Ajouter'),
  version_ptba: z.number().int().optional().default(0),
  structure: z.number().int().optional().default(0),
  id_personnel: z.number().optional().default(0),
  programme: z.number().int().min(0).default(0),
})

export type ContratPerformanceFormValues = z.infer<typeof contratPerformanceSchema>