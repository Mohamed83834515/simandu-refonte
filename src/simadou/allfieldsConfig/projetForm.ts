import type { FormConfig, SelectOption } from '../../Global/types/formConfig'
import type { Acteur } from '../allTypes/acteur'
import type { CategorieActeur } from '../allTypes/categorieActeur'
import type { Localite } from '../allTypes/localite'

function acteurHasCategoryCode(
  acteur: { categorie_acteur?: CategorieActeur | CategorieActeur[] | null },
  code: string
): boolean {
  const raw = acteur.categorie_acteur
  if (!raw) return false
  if (Array.isArray(raw)) {
    return raw.some((c) => c.code_cat === code)
  }
  return raw.code_cat === code
}

function acteurOptionsByCode(
  acteurs: Acteur[],
  code: string
): SelectOption[] {
  return acteurs
    .filter((a) => acteurHasCategoryCode(a, code))
    .map((a) => ({ value: a.id_acteur, label: a.nom_acteur }))
}

function signatairesOptions(acteurs: Acteur[]): SelectOption[] {
  return acteurs
    .filter(
      (a) =>
        acteurHasCategoryCode(a, '02') || acteurHasCategoryCode(a, '04')
    )
    .map((a) => ({ value: a.id_acteur, label: a.nom_acteur }))
}

function zoneOptions(localites: Localite[]): SelectOption[] {
  return localites
    .filter((z) => {
      const niveau = z.niveau_loca
      return typeof niveau === 'object' && niveau?.nombre_nlc === 1
    })
    .map((z) => ({ value: z.id_loca, label: z.intitule_loca }))
}

export const getProjetFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'code_projet',
      label: 'Code projet',
      type: 'text',
      placeholder: 'Ex: PRJ001, PROJ01...',
      required: true,
      gridCols: 2,
    },
    {
      name: 'sigle_projet',
      label: 'Sigle projet',
      type: 'text',
      placeholder: 'Ex: PAD, PEF, PAS...',
      required: true,
      gridCols: 2,
    },
    {
      name: 'intitule_projet',
      label: 'Intitulé projet',
      type: 'textarea',
      placeholder: 'Intitulé complet du projet',
      required: true,
      gridCols: 1,
    },
    {
      name: 'date_signature_projet',
      label: 'Date signature',
      type: 'date',
      placeholder: 'AAAA-MM-JJ',
      required: true,
      gridCols: 2,
    },
    {
      name: 'date_demarrage_projet',
      label: 'Date démarrage',
      type: 'date',
      placeholder: 'AAAA-MM-JJ',
      required: true,
      gridCols: 2,
    },

    {
      name: 'duree_projet',
      label: 'Durée projet',
      type: 'number',
      placeholder: 'Durée en mois',
      required: true,
      min: 1,
      gridCols: 2,
    },
    {
      name: 'partenaire_projet',
      label: 'Partenaire projet',
      type: 'select',
      placeholder: 'Sélectionner un partenaire (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
    
    {
      name: 'programme_projet',
      label: 'Programme projet',
      type: 'select',
      placeholder: 'Sélectionner un programme (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
    {
      name: 'structure_projet',
      label: 'Structure projet',
      type: 'select',
      placeholder: 'Sélectionner une structure',
      required: true,
      options: [],
      gridCols: 2,
    },
    {
      name: 'signataires_projet',
      label: 'Signataires projet',
      type: 'multiselect',
      placeholder: 'Sélectionner un ou plusieurs signataires',
      required: true,
      options: [],
      gridCols: 2,
    },
    {
      name: 'partenaires_execution_projet',
      label: 'Partenaires exécution',
      type: 'multiselect',
      placeholder: "Sélectionner un ou plusieurs partenaires d'exécution",
      required: true,
      options: [],
      gridCols: 2,
    },
    {
      name: 'zone_projet',
      label: 'Zone projet',
      type: 'multiselect',
      placeholder: 'Sélectionner une ou plusieurs localités',
      required: true,
      options: [],
      gridCols: 2,
    },
  ],
})

const STEP1_FIELD_NAMES = new Set([
  'code_projet',
  'sigle_projet',
  'intitule_projet',
  'duree_projet',
  'date_signature_projet',
  'date_demarrage_projet',
])

const STEP2_FIELD_NAMES = new Set([
  'partenaire_projet',
  'structure_projet',
  'signataires_projet',
  'partenaires_execution_projet',
  'zone_projet',
])

function mapProjetCreateStep2Field(
  field: FormConfig['fields'][number],
  acteurs: Acteur[],
  localites: Localite[]
) {
  switch (field.name) {
    case 'partenaire_projet':
      return {
        ...field,
        label: 'ONG/OPA',
        placeholder: 'Sélectionner une ONG/OPA',
        required: true,
        options: acteurOptionsByCode(acteurs, '07'),
      }
    case 'structure_projet':
      return {
        ...field,
        label: 'Unité de gestion',
        placeholder: 'Sélectionner une unité de gestion',
        options: acteurOptionsByCode(acteurs, '05'),
      }
    case 'signataires_projet':
      return {
        ...field,
        label: 'Signataires du projet',
        options: signatairesOptions(acteurs),
      }
    case 'partenaires_execution_projet':
      return {
        ...field,
        label: "Partenaires d'exécution",
        options: acteurOptionsByCode(acteurs, '01'),
      }
    case 'zone_projet':
      return {
        ...field,
        label: 'Zones',
        options: zoneOptions(localites),
      }
    default:
      return field
  }
}

/** Étape 1 — informations générales. */
export const getProjetFormConfigForCreateStep1 = (): FormConfig => ({
  fields: getProjetFormConfig().fields.filter((field) =>
    STEP1_FIELD_NAMES.has(field.name)
  ),
})

/** Étape 2 — acteurs et zones (programme injecté à la soumission). */
export const getProjetFormConfigForCreateStep2 = (
  acteurs: Acteur[] = [],
  localites: Localite[] = []
): FormConfig => ({
  fields: getProjetFormConfig()
    .fields.filter((field) => STEP2_FIELD_NAMES.has(field.name))
    .map((field) => mapProjetCreateStep2Field(field, acteurs, localites)),
})
