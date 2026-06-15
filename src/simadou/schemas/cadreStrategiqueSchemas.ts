import { z } from 'zod'

const optionalRelationId = z.preprocess(
  (val) => {
    if (val == null || val === '') return null
    const n = Number(val)
    return Number.isFinite(n) && n > 0 ? n : null
  },
  z.number().nullable().optional()
)

export const cadreStrategiqueWriteSchema = z.object({
  code_cs: z.string().min(1, 'Le code est obligatoire'),
  intutile_cs: z.string().min(1, "L'intitulé est obligatoire"),
  abgrege_cs: z.string().min(1, "L'abrégé est obligatoire"),
  parent_cs: optionalRelationId,
  partenaire_cs: z.array(z.coerce.number()).optional().default([]),
  niveau_cs: z.coerce.number().optional(),
  programme_cs: z.coerce.number().nullable().optional(),
})

export type CadreStrategiqueWriteData = z.infer<typeof cadreStrategiqueWriteSchema>

export const niveauCadreStrategiqueWriteSchema = z.object({
  libelle_nsc: z.string().min(1, 'Le libellé est obligatoire'),
  nombre_nsc: z.coerce.number().min(1, 'La taille du code doit être au moins 1'),
  code_number_nsc: z.coerce.number().min(1, 'Le numéro de niveau est obligatoire'),
  type_niveau: z.coerce.number().min(1).max(3),
  programme: z.string().optional(),
})

export type NiveauCadreStrategiqueWriteData = z.infer<
  typeof niveauCadreStrategiqueWriteSchema
>

// CadreStrategique Schema
export const cadreStrategiqueSchema = z.object({
  id_cs: z.number(),
  code_cs: z.string("Le code est requis").min(1, "Le code est requis").max(50),
  intutile_cs: z
    .string("L'intitulé est requis")
    .min(1, "L'intitulé est requis")
    .max(200),
  abgrege_cs: z
    .string("L'abrégé est requis")
    .min(1, "L'abrégé est requis")
    .max(100),
  niveau_cs: z.number("Le niveau est requis").min(1, "Le niveau est requis"),
  partenaire_cs: z.number().nullable().optional(),
  parent_cs: z.number().nullable().optional(),
  programme_cs: z.number().nullable().optional(),
});

export const cadreStrategiqueCreateSchema = cadreStrategiqueSchema.omit({
  id_cs: true,
});
export const cadreStrategiqueUpdateSchema =
  cadreStrategiqueCreateSchema.partial();

export type CadreStrategiqueCreateData = z.infer<
  typeof cadreStrategiqueCreateSchema
>;
export type CadreStrategiqueUpdateData = z.infer<
  typeof cadreStrategiqueUpdateSchema
>;

// CadreStrategiqueConfig Schema
export const cadreStrategiqueConfigSchema = z.object({
  id_csc: z.number(),
  nombre: z.number("Le nombre est requis").min(1, "Le nombre est requis"),
  libelle_csc: z
    .string("Le libellé est requis")
    .min(1, "Le libellé est requis")
    .max(100),
  type_csc: z.union([z.literal(1), z.literal(2), z.literal(3)], {
    message: "Le type doit être 1 (Effet), 2 (Produit) ou 3 (Impact)",
  }),
  programme: z.number().nullable().optional(),
});

export const cadreStrategiqueConfigCreateSchema =
  cadreStrategiqueConfigSchema.omit({
    id_csc: true,
  });
export const cadreStrategiqueConfigUpdateSchema =
  cadreStrategiqueConfigCreateSchema.partial();

export type CadreStrategiqueConfigCreateData = z.infer<
  typeof cadreStrategiqueConfigCreateSchema
>;
export type CadreStrategiqueConfigUpdateData = z.infer<
  typeof cadreStrategiqueConfigUpdateSchema
>;

// Helper function to get type label
export const getTypeLabel = (type: 1 | 2 | 3): string => {
  const typeLabels = {
    1: "Effet",
    2: "Produit",
    3: "Impact",
  };
  return typeLabels[type];
};

// Helper function to get type options for forms
export const getTypeOptions = () => [
  { value: 1, label: "Effet" },
  { value: 2, label: "Produit" },
  { value: 3, label: "Impact" },
];
