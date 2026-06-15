import { z } from "zod";

// Schéma pour le formulaire - SANS cibles
export const indicateurPerformanceFormSchema = z.object({
  code_indicateur_performance: z.string().min(1, "Le code est requis"),
  intitule_indicateur_tache: z.string().min(1, "L'intitulé est requis"),
  code_activite_projet: z.string().min(1, "L'activité est requise"),
  unite_indicateur_performance: z.number().min(1, "L'unité est requise"),
});

export type IndicateurPerformanceFormData = z.infer<typeof indicateurPerformanceFormSchema>;