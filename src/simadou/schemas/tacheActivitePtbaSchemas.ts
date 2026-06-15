import { z } from "zod";

// Schéma de validation pour TacheActivitePtba
export const tacheActivitePtbaSchema = z.object({
  intutile_tache_gt: z
    .string()
    .min(1, "L'intitulé de la tâche est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),

  proportion_gt: z
    .number("La proportion est requise")
    .min(0, "La proportion doit être supérieure ou égale à 0")
    .max(100, "La proportion doit être inférieure ou égale à 100"),

  code_tache_gt: z
    .string()
    .min(1, "Le code de la tâche est requis")
    .max(200, "Le code ne peut pas dépasser 200 caractères"),

  date_debut_gt: z
    .string()
    .min(1, "La date de début est requise")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),

  date_fin_gt: z
    .string()
    .min(1, "La date de fin est requise")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),

  n_lot_gt: z
    .number()
    .int("Le numéro de lot doit être un entier")
    .positive("Le numéro de lot doit être positif"),
  observation_gt: z
    .string()
    .max(200, "L'observation ne peut pas dépasser 200 caractères")
    .optional(),
  id_personnel_gt: z
    .number()
    .int("L'ID du personnel doit être un entier")
    .positive("L'ID du personnel doit être positif")
    .optional(),

  responsable_gt: z
    .number()
    .int("L'ID du responsable doit être un entier")
    .positive("L'ID du responsable doit être positif")
    .optional(),

  id_activite: z
    .number()
    .int("L'ID de l'activité doit être un entier")
    .positive("L'ID de l'activité doit être positif"),
});

// Type inféré du schéma
export type TacheActivitePtbaFormData = z.infer<typeof tacheActivitePtbaSchema>;

// Options pour les statuts de validation
export const statutValidationOptions = [
  { value: "En attente", label: "En attente" },
  { value: "En cours", label: "En cours" },
  { value: "Validé", label: "Validé" },
  { value: "Rejeté", label: "Rejeté" },
  { value: "Terminé", label: "Terminé" },
];
