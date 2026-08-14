import { z } from 'zod'
// import { isValidPhoneNumber } from 'react-phone-number-input'

function requiredPositiveInt(message: string) {
  return z.coerce
    .number({
      error: (issue) =>
        issue.input === '' || issue.input === undefined || issue.input === null
          ? message
          : message,
    })
    .int()
    .positive(message)
}

function optionalPositiveInt() {
  return z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number().int().positive().optional()
  )
}

export const NIVEAU_ACCES_OPTIONS = [
  { value: 1, label: 'Éditeur' },
  { value: 2, label: 'Visiteur' },
  { value: 3, label: 'Point focal Projet' },
] as const

export const personnelWriteSchema = z.object({
  nom_perso: z.string().min(1, 'Le nom est requis'),
  prenom_perso: z.string().min(1, 'Le prénom est requis'),
  id_personnel_perso: z.string().min(1, "L'identifiant est requis"),
  email: z.email('Format email invalide').max(254),
  titre_personnel: requiredPositiveInt('Le titre est requis'),
  contact_perso: z
    .string()
    .min(1, 'Le contact est requis')
    .max(15, 'Le contact doit comporter au maximum 15 caractères'),
    // .refine((v) => isValidPhoneNumber(v), { message: 'Numéro invalide' }),
  structure_perso: requiredPositiveInt('La structure est requise'),
  fonction_perso: requiredPositiveInt('La fonction est requise'),
  service_perso: optionalPositiveInt(),
  region_perso: requiredPositiveInt('La région est requise'),
  niveau_perso: requiredPositiveInt("Le niveau d'accès est requis"),
})

export type PersonnelWriteData = z.output<typeof personnelWriteSchema>
