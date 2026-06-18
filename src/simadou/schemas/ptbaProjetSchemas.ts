import { z } from 'zod'
import { chronogrammeSchema } from './ptbaSchemas'

export const ptbaProjetSchema = z.object({
  localites_ptba: z
    .array(z.number())
    .min(1, 'Au moins une localité doit être sélectionnée'),
  partenaire_conserne_ptba: z
    .array(z.number())
    .min(1, 'Au moins un partenaire doit être sélectionné'),
  code_activite_ptba: z
    .string()
    .min(1, "Le code d'activité est requis")
    .max(100, 'Le code ne peut pas dépasser 100 caractères'),
  intitule_activite_ptba: z
    .string()
    .min(1, "L'intitulé de l'activité est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  chronogramme: chronogrammeSchema,
  observation: z
    .string()
    .max(1000, "L'observation ne peut pas dépasser 1000 caractères")
    .optional(),
  statut_activite: z
    .string()
    .min(1, 'Le statut est requis')
    .max(100, 'Le statut ne peut pas dépasser 100 caractères'),
  code_crp: z
    .number()
    .positive('Le cadre stratégique doit être sélectionné')
    .optional(),
  cadre_analytique: z
    .number()
    .positive('Le cadre analytique doit être sélectionné')
    .optional(),
  responsable_ptba: z
    .number()
    .positive('Le responsable doit être sélectionné')
    .optional(),
  ugl_ptba: z.string().optional(),
  cout_ptba: z.number().optional(),
  code_projet: z.string().min(1, 'Le code projet est requis'),
  code_actvite_projet: z
    .number()
    .int("L'activité projet est requise")
    .positive("L'activité projet est requise"),
  version_ptba: z.number().optional(),
})

export type PtbaProjetFormData = z.infer<typeof ptbaProjetSchema>
