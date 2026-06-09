import z from "zod"

export const sourceFinancementProjetSchema = z.object({
  code_activite_projet: z
    .string()
    .min(1, "Le code est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),
  intitule_source_financement: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  Numero_reference_sf: z
    .string()
    .optional()
    .default(""), // Rempli par défaut, modifiable
  montant_source_financement: z
    .number()
    .min(1, "Le montant est requis"),
  date_signature_convention: z
    .string()
    .min(1, "La date de signature est requise"),
  code_partenaire: z
    .string()
    .min(1, "Le partenaire est requis"),
  etat_source_financement: z
    .number()
    .optional()
    .default(0),
})

export type SourceFinancementProjetFormData = z.infer<typeof sourceFinancementProjetSchema>