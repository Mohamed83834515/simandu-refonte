import type { FormConfig, SelectOption } from '../../Global/types/formConfig'
import type { Acteur } from '../allTypes/acteur'
import type { CategorieActeur } from '../allTypes/categorieActeur'
import type { Localite } from '../allTypes/localite'

// ── Helpers ────────────────────────────────────────────────────────────────────

function acteurHasCategoryCode(
  acteur: { categorie_acteur?: CategorieActeur | CategorieActeur[] | null },
  code: string
): boolean {
  const raw = acteur.categorie_acteur
  if (!raw) return false
  return Array.isArray(raw)
    ? raw.some((c) => c.code_cat === code)
    : raw.code_cat === code
}

function acteurOptionsByCode(acteurs: Acteur[], code: string): SelectOption[] {
  return acteurs
    .filter((a) => acteurHasCategoryCode(a, code))
    .map((a) => ({ value: a.id_acteur, label: a.nom_acteur }))
}

function ptfOptions(acteurs: Acteur[]): SelectOption[] {
  // Partenaires financiers = catégorie '02' ou '04'
  return acteurs
    .filter((a) => acteurHasCategoryCode(a, '02') || acteurHasCategoryCode(a, '04'))
    .map((a) => ({ value: a.id_acteur, label: a.nom_acteur }))
}

function zoneOptions(localites: Localite[]): SelectOption[] {
  return localites
    .filter((z) => typeof z.niveau_loca === 'object' && z.niveau_loca?.nombre_nlc === 1)
    .map((z) => ({ value: z.id_loca, label: z.intitule_loca }))
}

// ── Config principale ──────────────────────────────────────────────────────────
// Les options sont injectées ici directement depuis le composant AddProjet,
// pas chargées dans le fichier config (await top-level interdit dans un module React).

export const getProjetFormConfig = (
  acteurs: Acteur[] = [],
  localites: Localite[] = []
): FormConfig => ({

  // ── Étapes déclarées une seule fois ──
  steps: [
    { step: 1, title: 'Informations générales' },
    { step: 2, title: 'Acteurs & zones' },
  ],

  fields: [

    // ════════════ ÉTAPE 1 — Informations générales ════════════

    {
      name:        'code_projet',
      label:       'Code projet',
      type:        'text',
      placeholder: 'Ex : PRJ001, PROJ01…',
      required:    true,
      gridCols:    2,
      formStep:    1,
    },
    {
      name:        'sigle_projet',
      label:       'Sigle projet',
      type:        'text',
      placeholder: 'Ex : PAD, PEF, PAS…',
      required:    true,
      gridCols:    2,
      formStep:    1,
    },
    {
      name:        'intitule_projet',
      label:       'Intitulé du projet',
      type:        'textarea',
      placeholder: 'Intitulé complet du projet',
      required:    true,
      gridCols:    1,
      formStep:    1,
    },
    {
      name:        'date_signature_projet',
      label:       'Date de signature',
      type:        'date',
      required:    true,
      gridCols:    2,
      formStep:    1,
    },
    {
      name:        'date_demarrage_projet',
      label:       'Date de démarrage',
      type:        'date',
      required:    true,
      gridCols:    2,
      formStep:    1,
    },
    {
      name:        'duree_projet',
      label:       'Durée (en mois)',
      type:        'number',
      placeholder: 'Ex : 36',
      required:    true,
      min:         1,
      gridCols:    2,
      formStep:    1,
    },

    // ════════════ ÉTAPE 2 — Acteurs & zones ════════════

    {
      name:        'signataires_projet',
      label:       'Partenaires financiers (PTF)',
      type:        'multiselect',
      placeholder: 'Sélectionner un ou plusieurs PTF',
      required:    true,
      options:     ptfOptions(acteurs),
      gridCols:    2,
      formStep:    2,
    },
    {
      name:        'structure_projet',
      label:       'Unité de gestion',
      type:        'select',
      placeholder: 'Sélectionner une unité de gestion',
      required:    true,
      options:     acteurOptionsByCode(acteurs, '05'),
      gridCols:    2,
      formStep:    2,
    },
    {
      name:        'partenaires_execution_projet',
      label:       "Partenaires d'exécution",
      type:        'multiselect',
      placeholder: 'Sélectionner un ou plusieurs partenaires',
      required:    true,
      options:     acteurOptionsByCode(acteurs, '01'),
      gridCols:    2,
      formStep:    2,
    },
    {
      name:        'zone_projet',
      label:       "Zones d'intervention",
      type:        'multiselect',
      placeholder: 'Sélectionner une ou plusieurs préfectures',
      required:    true,
      options:     zoneOptions(localites),
      gridCols:    2,
      formStep:    2,
    },
    {
      name:        'partenaire_projet',
      label:       'ONG / OPA',
      type:        'select',
      placeholder: 'Sélectionner une ou plusieurs ONG/OPA',
      required:    false,
      options:     acteurOptionsByCode(acteurs, '07'),
      gridCols:    1,
      formStep:    2,
    },
  ],
})