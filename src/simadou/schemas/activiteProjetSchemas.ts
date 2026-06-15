import { z } from "zod";

// ============================================
// SCHÉMA NIVEAU ACTIVITÉ PROJET
// ============================================

export const niveauActiviteProjetSchema = z.object({
  libelle_niveau_activite_projet: z
    .string()
    .min(1, "Le libellé du niveau est requis")
    .max(100, "Le libellé ne peut pas dépasser 100 caractères"),

  taille_code_niveau_activite_projet: z
    .number()
    .int("La taille du code doit être un entier")
    .min(1, "La taille du code doit être au moins 1")
    .max(10, "La taille du code ne peut pas dépasser 10"),

  nombre_niveau_activite_projet: z
    .number()
    .int("Le nombre doit être un entier")
    .positive("Le nombre doit être positif"),

  code_projet: z
    .string()
    .max(50, "Le code projet ne peut pas dépasser 50 caractères")
    .nullable()
    .optional(),
});

// Type inféré du schéma
export type NiveauActiviteProjetFormData = z.infer<
  typeof niveauActiviteProjetSchema
>;

// ============================================
// SCHÉMA ACTIVITÉ PROJET
// ============================================

export const activiteProjetSchema = z.object({
  code_activite_projet: z
    .string()
    .min(1, "Le code de l'activité est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),

  intitule_activite_projet: z
    .string()
    .min(1, "L'intitulé de l'activité est requis")
    .max(255, "L'intitulé ne peut pas dépasser 255 caractères"),

  niveau_activite_projet: z
    .number()
    .int("Le niveau doit être un entier")
    .positive("Le niveau doit être positif"),

  parent_activite_projet: z
    .number()
    .int("L'ID du parent doit être un entier")
    .positive("L'ID du parent doit être positif")
    .nullable()
    .optional(),

  code_activite_programme: z
    .string()
    .max(50, "Le code ne peut pas dépasser 50 caractères")
    .nullable()
    .optional(),

  code_projet: z
    .string()
    .max(50, "Le code projet ne peut pas dépasser 50 caractères")
    .nullable()
    .optional(),
});

// Schéma pour la création (sans l'ID)
export const activiteProjetCreateSchema = activiteProjetSchema;

export function getActiviteProjetFormSchema({
  fixedCodeLength,
  niveau,
  parentNiveauLabel,
}: {
  fixedCodeLength: number;
  niveau: number;
  parentNiveauLabel: string;
}) {
  return activiteProjetSchema.extend({
    code_activite_projet: z
      .string()
      .length(
        fixedCodeLength,
        `Le code doit contenir exactement ${fixedCodeLength} caractère(s) selon la configuration du niveau ${niveau}`,
      ),
    parent_activite_projet:
      niveau > 1
        ? z
            .number()
            .int("L'ID du parent doit être un entier")
            .positive("L'ID du parent doit être positif")
            .nullable()
            .refine((value) => value != null, {
              message: `Sélectionnez un ${parentNiveauLabel.toLowerCase()}`,
            })
        : z
            .number()
            .int("L'ID du parent doit être un entier")
            .positive("L'ID du parent doit être positif")
            .nullable()
            .optional(),
    code_projet: z
      .string()
      .min(1, "Le projet est requis")
      .max(50, "Le code projet ne peut pas dépasser 50 caractères"),
  });
}

// Schéma pour la mise à jour (tous les champs optionnels sauf l'ID)
export const activiteProjetUpdateSchema = activiteProjetSchema.partial();

// Type inféré du schéma
export type ActiviteProjetFormData = z.infer<typeof activiteProjetSchema>;

// ============================================
// SCHÉMA INDICATEUR PERFORMANCE PROJET
// ============================================

export const indicateurPerformanceProjetSchema = z.object({
  code_indicateur_performance: z
    .string()
    .min(1, "Le code de l'indicateur est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),

  intitule_indicateur_tache: z
    .string()
    .min(1, "L'intitulé de l'indicateur est requis")
    .max(255, "L'intitulé ne peut pas dépasser 255 caractères"),

  code_activite_projet: z
    .union([z.string(), z.number()])
    .nullable()
    .optional(),

  unite_indicateur_performance: z
    .number()
    .int("L'ID de l'unité doit être un entier")
    .positive("L'ID de l'unité doit être positif")
    .nullable()
    .optional(),

  code_projet: z
    .string()
    .max(50, "Le code projet ne peut pas dépasser 50 caractères")
    .nullable()
    .optional(),
});

// Schéma pour la création
export const indicateurPerformanceProjetCreateSchema =
  indicateurPerformanceProjetSchema;

// Schéma pour la mise à jour
export const indicateurPerformanceProjetUpdateSchema =
  indicateurPerformanceProjetSchema.partial();

// Type inféré du schéma
export type IndicateurPerformanceProjetFormData = z.infer<
  typeof indicateurPerformanceProjetSchema
>;

// ============================================
// SCHÉMA INDICATEUR ACTIVITÉ PTBA
// ============================================

export const indicateurActivitePtbaSchema = z.object({
  code_indicateur_activite: z
    .string()
    .min(1, "Le code de l'indicateur est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),

  intitule_indicateur_tache: z
    .string()
    .min(1, "L'intitulé de l'indicateur est requis")
    .max(255, "L'intitulé ne peut pas dépasser 255 caractères"),

  activite_ptba: z
    .union([z.string(), z.number()])
    .nullable()
    .optional(),

  code_indicateur_performance: z
    .union([z.string(), z.number()])
    .nullable()
    .optional(),

  abrege_unite: z
    .number()
    .int("L'ID de l'unité doit être un entier")
    .positive("L'ID de l'unité doit être positif")
    .nullable()
    .optional(),
});

// Schéma pour la création
export const indicateurActivitePtbaCreateSchema = indicateurActivitePtbaSchema;

// Schéma pour la mise à jour
export const indicateurActivitePtbaUpdateSchema =
  indicateurActivitePtbaSchema.partial();

// Type inféré du schéma
export type IndicateurActivitePtbaFormData = z.infer<
  typeof indicateurActivitePtbaSchema
>;
