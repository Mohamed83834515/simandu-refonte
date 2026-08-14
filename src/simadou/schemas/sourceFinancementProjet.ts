import z from "zod"

export const sourceFinancementProjetSchema = z.object({
  code_activite_projet: z.coerce
    .number()
    .min(1, "L'activité est requise"),
  intitule_source_financement: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  Numero_reference_sf: z
    .string()
    .optional()
    .default(""),
  montant_source_financement: z.coerce
    .number()
    .min(1, "Le montant est requis"),
  date_signature_convention: z
    .string()
    .min(1, "La date de signature est requise"),
  code_partenaire: z
    .string()
    .min(1, "Le partenaire est requis"),
  etat_source_financement: z.coerce
    .number()
    .optional()
    .default(0),
})

export type SourceFinancementProjetFormData = z.infer<typeof sourceFinancementProjetSchema>