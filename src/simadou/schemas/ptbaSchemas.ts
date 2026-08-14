import { z } from "zod";

// Schéma pour TypeActivite
export const typeActiviteSchema = z.object({
  code_type: z
    .string()
    .min(1, "Le code est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),
  intutile_type: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(1000, "L'intitulé ne peut pas dépasser 1000 caractères"),
  description: z
    .string()
   .optional(),
});

// Schéma pour VersionPtba
export const versionPtbaSchema = z.object({
  annee_ptba: z
    .number()
    .min(2000, "L'année doit être supérieure à 2020")
    .max(2050, "L'année doit être inférieure à 2050"),
  version_ptba: z
    .string()
    .max(30, "La version ne peut pas dépasser 30 caractères")
    .optional(),
  date_validation: z.string().min(1, "La date de validation est requise"),
  observation: z
    .string()
    .max(500, "L'observation ne peut pas dépasser 500 caractères")
    .optional(),
  documentUrl: z.union([
    z.instanceof(File),
    z.string().
      optional(),
  ]),
  statut_version: z
    .number()
    .int("Le statut doit être un entier")
    .min(0, "Le statut doit être 0, 1 ou 2")
    .max(2, "Le statut doit être 0, 1 ou 2")
    .optional(),
  etat: z.string().optional(),
  modifier_par: z
    .string()
    .max(100, "Le nom du modificateur ne peut pas dépasser 100 caractères")
    .optional(),
  responsable_ptba: z.string().optional(),
  id_personnel: z.number().optional(),
  programme: z.string().optional(),
});

// Schéma pour les mois du chronogramme
export const chronogrammeSchema = z
  .string()
  .min(1, "Au moins un mois doit être sélectionné")
  .refine(
    (value) => {
      const moisValides = [
        "Jan",
        "Fév",
        "Mar",
        "Avr",
        "Mai",
        "Jun",
        "Jul",
        "Aoû",
        "Sep",
        "Oct",
        "Nov",
        "Déc",
      ];
      const moisSaisis = value.split(",").map((m) => m.trim());
      return moisSaisis.every((mois) => moisValides.includes(mois));
    },
    {
      message:
        "Le chronogramme contient des mois invalides",
    }

  );
// Schéma pour Ptba
export const ptbaSchema = z.object({
  localites_ptba: z
    .array(z.number())
    .min(1, "Au moins une direction régionale doit être sélectionnée"),
  partenaire_conserne_ptba: z
    .array(z.number())
    .min(1, "Au moins une direction/service doit être sélectionnée"),
  code_activite_ptba: z
    .string()
    .min(1, "Le code d'activité est requis")
    .max(50, "Le code ne peut pas dépasser 50 caractères"),
  intitule_activite_ptba: z
    .string()
    .min(1, "L'intitulé de l'activité est requis")
    .max(200, "L'intitulé ne peut pas dépasser 200 caractères"),
  chronogramme: chronogrammeSchema,
  observation: z
    .string()
    .max(1000, "L'observation ne peut pas dépasser 1000 caractères")
    .optional(),
  statut_activite: z
    .string()
    .min(1, "Le statut est requis")
    .max(100, "Le statut ne peut pas dépasser 100 caractères"),
  code_crp: z
    .number()
    .positive("Le cadre stratégique doit être sélectionné")
    .optional(),
  cadre_analytique: z
    .number()
    .positive("Le cadre analytique doit être sélectionné")
    .optional(),
  responsable_ptba: z
    .number()
    .positive("Le responsable doit être sélectionné")
    .optional(),
  ugl_ptba: z
    .string()
    .max(50, "Le code unité de gestion ne peut pas dépasser 50 caractères")
    .optional(),
  code_programme: z
    .string()
    .max(50, "Le code programme ne peut pas dépasser 50 caractères")
    .optional(),
  version_ptba: z
    .number("La version PTBA est requise"),
  type_activite: z
    .string()
    .min(1, "Le type d'activité doit être sélectionné"),
});

// Types dérivés des schémas
export type TypeActiviteFormData = z.infer<typeof typeActiviteSchema>;
export type VersionPtbaFormData = z.infer<typeof versionPtbaSchema>;
export type PtbaFormData = z.infer<typeof ptbaSchema>;

// Fonctions utilitaires
export const getStatutVersionLabel = (statut: number | undefined): string => {
  const labels: Record<number, string> = {
    0: "En construction",
    1: "Validée",
    2: "Archivée",
  };
  return statut ? labels[statut] : "En construction";
};

export const getStatutVersionColor = (statut: number | undefined): string => {
  const colors: Record<number, string> = {
    0: "bg-yellow-100 text-yellow-800",
    1: "bg-green-100 text-green-800",
    2: "bg-gray-100 text-gray-800",
  };
  return statut ? colors[statut] : "bg-gray-100 text-gray-800";
};

export const getMoisOptions = () => [
  { value: "Jan", label: "J" },
  { value: "Fév", label: "F" },
  { value: "Mar", label: "M" },
  { value: "Avr", label: "A" },
  { value: "Mai", label: "M" },
  { value: "Jun", label: "J" },
  { value: "Jul", label: "J" },
  { value: "Aoû", label: "A" },
  { value: "Sep", label: "S" },
  { value: "Oct", label: "O" },
  { value: "Nov", label: "N" },
  { value: "Déc", label: "D" },
];

export const formatChronogramme = (chronogramme: string): string => {
  const moisMap = getMoisOptions().reduce((acc, mois) => {
    acc[mois.value] = mois.label;
    return acc;
  }, {} as Record<string, string>);

  return chronogramme
    .split(",")
    .map((m) => m.trim())
    .map((m) => moisMap[m] || m)
    .join(", ");
};
