import z from "zod";

// Schéma pour VersionPPM
export const versionPPMSchema = z.object({
  numero_version_ppm: z
    .string()
    .min(1, "Le numéro de version est obligatoire"),
  date_version: z.string().min(1, "La date de validation est requise"),
  modifier_par: z
    .number()
    .optional(),
  date_modification: z.string().optional(),
  date_enregistrement: z.string().optional(),
});

export type VersionPPMFormData = z.infer<typeof versionPPMSchema>;
