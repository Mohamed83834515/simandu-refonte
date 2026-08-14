import { z } from "zod";

// Schéma de validation pour Type  projet basé sur la documentation
export const typeProjetSchema = z.object({
  // Code type  projet - AN 20 caractères, requis
  code_type_projet: z
    .string()
    .min(1, "Code type projet requis")
    .max(20, "Code ne peut pas dépasser 20 caractères")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Code doit contenir uniquement des lettres et chiffres"
    ),

  // Nom type  projet - A (alphabétique), optionnel
  nom_type_projet: z.string().min(1, "Nom type projet requis"),
});

export type TypeProjetFormData = z.infer<typeof typeProjetSchema>;
