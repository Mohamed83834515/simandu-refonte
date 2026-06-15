import { z } from "zod";

// NiveauCadreResultat Schema
export const niveauCadreResultatSchema = z.object({
  id_ncr: z.number(),
  nombre_ncr: z
    .number()
    .min(1, "Le nombre est requis")
    .int("Le nombre doit être un entier"),
  libelle_ncr: z
    .string()
    .min(1, "Le libellé est requis")
    .max(100, "Le libellé ne peut pas dépasser 100 caractères"),
  code_number_ncr: z
    .number()
    .min(1, "Le code numérique est requis")
    .int("Le code numérique doit être un entier"),
  type_niveau: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .refine((val) => [1, 2, 3].includes(val), {
      message: "Le type de niveau doit être 1 (Effet), 2 (Produit) ou 3 (Impact)",
    }),
});

export const niveauCadreResultatCreateSchema = niveauCadreResultatSchema.omit({
  id_ncr: true,
});

export const niveauCadreResultatUpdateSchema = niveauCadreResultatCreateSchema.partial();

export type NiveauCadreResultatCreateData = z.infer<typeof niveauCadreResultatCreateSchema>;
export type NiveauCadreResultatUpdateData = z.infer<typeof niveauCadreResultatUpdateSchema>;

// CadreResultat Schema
export const cadreResultatSchema = z.object({
  id_cr: z.number(),
  code_cr: z
    .string()
    .min(1, "Le code est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),
  intutile_cr: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  abgrege_cr: z
    .string()
    .min(1, "L'abrégé est requis")
    .max(50, "L'abrégé ne peut pas dépasser 50 caractères"),
  cout_axe: z.coerce
    .number()
    .min(0, "Le coût doit être positif")
    .int("Le coût doit être un entier"),
  date_enregistrement: z.string(),
  date_modification: z.string(),
  etat: z.string().nullable().optional(),
  niveau_cr: z.coerce.number().nullable().optional(),
  partenaire_cr: z.string().nullable().optional(),
  parent_cr: z.union([z.string(), z.number()]).nullable().optional(),
  projet_cr: z.union([z.string(), z.number()]).nullable().optional(),
});

export const cadreResultatCreateSchema = cadreResultatSchema.omit({
  id_cr: true,
  date_enregistrement: true,
  date_modification: true,
});

export const cadreResultatUpdateSchema = cadreResultatCreateSchema.partial();

export type CadreResultatCreateData = z.infer<typeof cadreResultatCreateSchema>;
export type CadreResultatUpdateData = z.infer<typeof cadreResultatUpdateSchema>;

// Utility functions
export const getTypeNiveauLabel = (type: 1 | 2 | 3): string => {
  switch (type) {
    case 1:
      return "Effet";
    case 2:
      return "Produit";
    case 3:
      return "Impact";
    default:
      return "Inconnu";
  }
};

export const getTypeNiveauOptions = () => [
  { value: 1, label: "Effet" },
  { value: 2, label: "Produit" },
  { value: 3, label: "Impact" },
];

export const getTypeNiveauColor = (type: 1 | 2 | 3): string => {
  switch (type) {
    case 1:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case 2:
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case 3:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};
