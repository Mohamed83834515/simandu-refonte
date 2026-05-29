import { z } from "zod";
import {
  parseOptionalNumber,
  resolveRelationId,
} from "@/simadou/lib/resolveApiRelation";

export const cibleCmrProjetSchema = z.object({
  annee: z.string().min(1, "L'année est obligatoire"),
  valeur_cible_indcateur_crp: z.coerce
    .number()
    .min(0, "La valeur cible doit être positive")
    .int("La valeur cible doit être un entier"),
  /** FK vers IndicateurCadreResultat (id_indicateur_cr_iop côté API). */
  code_indicateur_crp: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      return parseOptionalNumber(value);
    }),
  code_ug: z
    .string()
    .max(50, "Le code UG ne peut pas dépasser 50 caractères")
    .nullable()
    .optional(),
  code_projet: z
    .string()
    .max(100, "Le code projet ne peut pas dépasser 100 caractères")
    .nullable()
    .optional(),
});

export type CibleCmrProjetFormData = z.infer<typeof cibleCmrProjetSchema>;

// Type pour les relations
export type CibleCmrProjetWithRelations = CibleCmrProjetFormData & {
  indicateur_crp?: any;
  ugl?: any;
};

// Schéma pour la mise à jour (tous les champs optionnels)
export const cibleCmrProjetUpdateSchema = cibleCmrProjetSchema.partial();

export type CibleCmrProjetUpdateData = z.infer<
  typeof cibleCmrProjetUpdateSchema
>;

// Fonction utilitaire pour formater la valeur cible
export const formatValeurCible = (valeur: number): string => {
  return new Intl.NumberFormat("fr-FR").format(valeur);
};

export function formatAnneeCible(annee: string | null | undefined): string {
  if (annee == null || annee === "") return "—";
  const date = new Date(annee);
  if (Number.isFinite(date.getTime())) return String(date.getFullYear());
  return annee.slice(0, 4);
}

/** API expects YYYY-MM-DD (not ISO datetime). */
export function formatAnneeCibleForApi(annee: string): string {
  if (!annee) return annee;
  if (/^\d{4}-\d{2}-\d{2}$/.test(annee)) return annee;

  const year = formatAnneeCible(annee);
  if (year === "—") return annee;

  return `${year}-01-01`;
}

/** Match API/store annee value to a select option (ISO dates may differ by timezone). */
export function normalizeAnneeCibleForForm(
  annee: string | null | undefined,
  options: { value: string | number; label: string }[],
): string {
  if (!annee) return "";

  const apiDate = formatAnneeCibleForApi(annee);
  const exact = options.find((o) => String(o.value) === apiDate);
  if (exact) return String(exact.value);

  const exactRaw = options.find((o) => String(o.value) === annee);
  if (exactRaw) return String(exactRaw.value);

  const year = formatAnneeCible(annee);
  if (year === "—") return "";

  const byLabel = options.find((o) => o.label === year);
  return byLabel != null ? String(byLabel.value) : apiDate;
}

/** API attend l'id indicateur (PK), pas le code IOP. */
export function resolveCodeIndicateurCrpForForm(
  cible: {
    code_indicateur_crp?: unknown;
    indicateur_crp?: unknown;
  } | null
  | undefined,
): number | null {
  if (!cible) return null;

  return (
    resolveRelationId(cible.code_indicateur_crp, "id_indicateur_cr_iop") ??
    resolveRelationId(cible.indicateur_crp, "id_indicateur_cr_iop") ??
    (typeof cible.code_indicateur_crp === "number"
      ? cible.code_indicateur_crp
      : parseOptionalNumber(cible.code_indicateur_crp))
  );
}

export function lookupIndicateurCadreResultatByCrpId<
  T extends {
    id_indicateur_cr_iop: number;
    code_indicateur_cr_iop: string;
    intitule_indicateur_cr_iop: string;
  },
>(indicateurCrpId: number | null | undefined, indicateurs: T[]): T | null {
  if (indicateurCrpId == null) return null;
  return (
    indicateurs.find((i) => i.id_indicateur_cr_iop === indicateurCrpId) ?? null
  );
}
