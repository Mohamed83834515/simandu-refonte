import { z } from "zod";

// UniteIndicateur Schema
export const uniteIndicateurSchema = z.object({
  unite_ui: z
    .string()
    .min(1, "L'unité est requise")
    .max(50, "L'unité ne peut pas dépasser 50 caractères"),
  definition_ui: z
    .string()
    .min(1, "La définition est requise")
    .max(500, "La définition ne peut pas dépasser 500 caractères"),
});

export const uniteIndicateurCreateSchema = uniteIndicateurSchema;
export const uniteIndicateurUpdateSchema = uniteIndicateurSchema.partial();

export type UniteIndicateurCreateData = z.infer<
  typeof uniteIndicateurCreateSchema
>;
export type UniteIndicateurUpdateData = z.infer<
  typeof uniteIndicateurUpdateSchema
>;

// CadreSecteur Schema
export const cadreSecteurSchema = z.object({
  id_cl: z.number(),
  code_cl: z.string().min(1, "Le code est requis").max(50),
  intitule_cl: z.string().min(1, "L'intitulé est requis").max(200),
  abrege_cl: z.string().min(1, "L'abrégé est requis").max(50),
  niveau_cl: z.number().min(1, "Le niveau est requis"),
  parent_cl: z.number().nullable().optional(),
  id_programme: z.number().nullable().optional(),
});

export const cadreSecteurCreateSchema = cadreSecteurSchema.omit({
  id_cl: true,
});
export const cadreSecteurUpdateSchema = cadreSecteurCreateSchema.partial();

export type CadreSecteurCreateData = z.infer<typeof cadreSecteurCreateSchema>;
export type CadreSecteurUpdateData = z.infer<typeof cadreSecteurUpdateSchema>;

// IndicateurCadreResultat Schema
export const indicateurCadreResultatSchema = z.object({
  id_indicateur_cr_iop: z.number(),
  niveau_iop: z.coerce.number().min(1, "Le niveau est requis"),
  code_indicateur_cr_iop: z.string().min(1, "Le code est requis").max(50),
  code_cr_iop: z.string().min(1, "Le code CR est requis").max(50),
  intitule_indicateur_cr_iop: z
    .string()
    .min(1, "L'intitulé est requis")
    .max(200),
  periodicite_iop: z.string().min(1, "La périodicité est requise").max(50),
  source_iop: z.string().min(1, "La source est requise").max(200),
  responsable_iop: z.string().min(1, "Le responsable est requis").max(200),
  description_iop: z.string().min(1, "La description est requise").max(1000),
  structure_iop: z.string().max(200).optional(),
  projet_iop: z.string().max(200).optional(),
});

export const indicateurCadreResultatCreateSchema =
  indicateurCadreResultatSchema.omit({ id_indicateur_cr_iop: true });
export const indicateurCadreResultatUpdateSchema =
  indicateurCadreResultatCreateSchema.partial();

export type IndicateurCadreResultatCreateData = z.infer<
  typeof indicateurCadreResultatCreateSchema
>;
export type IndicateurCadreResultatUpdateData = z.infer<
  typeof indicateurCadreResultatUpdateSchema
>;

// IndicateurCmr Schema
export const indicateurCmrSchema = z.object({
  id_ref_ind_cmr: z.number(),
  code_ref_ind: z.string().min(1, "Le code est requis").max(50),
  resultat_cmr: z.preprocess(
    (value) =>
      value === "" || value == null || value === 0 ? undefined : value,
    z.coerce.number().min(1, "Le résultat est requis")
  ),
  intitule_ref_ind: z.string().min(1, "L'intitulé est requis").max(200),
  reference_cmr: z.string().min(1, "La référence est requise").max(200),
  annee_reference: z.coerce
    .number()
    .min(2000, "Année invalide")
    .max(2050, "Année invalide"),
  responsable_collecte_cmr: z
    .string()
    .min(1, "Le responsable est requis")
    .max(100),
  cible_cmr: z.string().min(1, "La cible est requise").max(50),
  fonction_agregat_cmr: z
    .string()
    .min(1, "La fonction d'agrégation est requise")
    .max(100),
  referentiel_cmr: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((value) => {
      if (value == null || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }),
});

export const indicateurCmrCreateSchema = indicateurCmrSchema.omit({
  id_ref_ind_cmr: true,
});
export const indicateurCmrUpdateSchema = indicateurCmrCreateSchema.partial();

export type IndicateurCmrCreateData = z.infer<typeof indicateurCmrCreateSchema>;
export type IndicateurCmrUpdateData = z.infer<typeof indicateurCmrUpdateSchema>;

// DictionnaireIndicateur Schema
export const dictionnaireIndicateurSchema = z.object({
  id_ref_ind_ref: z.number(),
  code_ref_ind: z.string().min(1, "Le code est requis").max(50),
  intitule_ref_ind: z
    .string("L'intitulé est requis")
    .min(1, "L'intitulé est requis")
    .max(200),
  unite_cmr: z.number("L'unité est requise").min(1, "L'unité est requise"),
  fonction_agregat_cmr: z
    .string("La fonction d'agrégation est requise")
    .max(100),
  echelle: z.number("L'échelle est requise").min(1, "L'échelle est requise"),
  typologie: z.string("La typologie est requise").max(50),
  seuil_minimum: z.number("Le seuil minimum est requis").min(0, "Le seuil minimum doit être positif"),
  seuil_maximum: z.number("Le seuil maximum est requis").min(0, "Le seuil maximum doit être positif"),
  responsable_collecte_cmr: z
    .number("Le responsable de collecte est requis")
    .min(1, "Le responsable de collecte est requis"),
});

export const dictionnaireIndicateurCreateSchema =
  dictionnaireIndicateurSchema.omit({ id_ref_ind_ref: true });

export type DictionnaireIndicateurCreateData = z.infer<
  typeof dictionnaireIndicateurCreateSchema
>;