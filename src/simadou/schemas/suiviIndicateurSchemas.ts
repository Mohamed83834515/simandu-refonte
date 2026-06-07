import { z } from "zod";

// ============================================
// SCHÉMA SUIVI INDICATEUR ACTIVITÉ
// ============================================

export const suiviIndicateurActiviteSchema = z.object({
  date_suivi_indicateur: z
    .string()
    .min(1, "La date de suivi est requise")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Format de date invalide",
    }),

  valeur_suivi_indicateur: z
    .number("La valeur doit être un nombre")
    .finite("La valeur doit être un nombre fini"),

  indicateur_activite: z
    .string()
    .min(1, "Le code de l'indicateur est requis")
    .nullable()
    .optional(),

  localite: z
    .string()
    .min(1, 'La commune est requise'),
});

// Schéma pour la création
export const suiviIndicateurActiviteCreateSchema =
  suiviIndicateurActiviteSchema;

// Schéma pour la mise à jour
export const suiviIndicateurActiviteUpdateSchema =
  suiviIndicateurActiviteSchema.partial();

// Type inféré du schéma
export type SuiviIndicateurActiviteFormData = z.infer<
  typeof suiviIndicateurActiviteSchema
>;
