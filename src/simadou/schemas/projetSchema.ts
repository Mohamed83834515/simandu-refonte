// schemas/projectSchema.ts
import { z } from "zod";

export const projectCreateSchema = z.object({
  code_projet: z.string().min(1, "Code requis"),
  sigle_projet: z.string().min(1, "Sigle requis"),
  intitule_projet: z.string().min(1, "Intitulé requis"),
  type_projet: z.number().min(1, "Type requis"),
  programme_projet: z.number().min(1, "Programme requis"),
  duree_projet: z.coerce.number().min(1, "Durée requise"),
  date_signature_projet: z.string().min(1, "Date de signature requise"),
  date_demarrage_projet: z.string().min(1, "Date de démarrage requise"),

  // Étape 2
  partenaire_projet: z.number("ONG/OPA requise").min(1, "ONG/OPA requise"),
  structure_projet: z
    .number("Unité de gestion requise")
    .min(1, "Unité de gestion requise"),
  signataires_projet: z.array(z.number()).min(1, "Partenaire Financier requise"),
  partenaires_execution_projet: z
    .array(z.number())
    .min(1, "Partenaires d'execution requis"),
  zone_projet: z.array(z.number()).min(1, "Zones requises"),
});

export const projectCreateStep1Schema = projectCreateSchema.pick({
  code_projet: true,
  sigle_projet: true,
  intitule_projet: true,
  duree_projet: true,
  date_signature_projet: true,
  date_demarrage_projet: true,
});

export const projectCreateStep2Schema = projectCreateSchema.pick({
  partenaire_projet: true,
  structure_projet: true,
  signataires_projet: true,
  partenaires_execution_projet: true,
  zone_projet: true,
});

export type ProjectCreateData = z.infer<typeof projectCreateSchema>;
export type ProjectCreateStep1Data = z.infer<typeof projectCreateStep1Schema>;
export type ProjectCreateStep2Data = z.infer<typeof projectCreateStep2Schema>;
