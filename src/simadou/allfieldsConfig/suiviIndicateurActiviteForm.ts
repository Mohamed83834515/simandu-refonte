import type { FormConfig } from '../../Global/types/formConfig'
import type { Localite } from '../allTypes/localite'

export const getSuiviIndicateurActiviteFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'date_suivi_indicateur',
      label: 'Date suivi',
      type: 'date',
      placeholder: 'AAAA-MM-JJ',
      required: true,
      gridCols: 1,
    },
    {
      name: 'valeur_suivi_indicateur',
      label: 'Valeur',
      type: 'number',
      placeholder: 'Ex: 100, 500, 1000.50…',
      required: true,
      min: 0,
      gridCols: 1,
    },
    {
      name: 'indicateur_activite',
      label: 'Indicateur activité',
      type: 'select',
      placeholder: 'Sélectionner un indicateur (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
    {
      name: 'localite',
      label: 'Commune',
      type: 'select',
      placeholder: 'Sélectionner une commune',
      required: true,
      options: [],
      gridCols: 1,
    },
  ],
})

/** Formulaire suivi indicateur dans le modal suivi PTBA (indicateur déjà connu). */
export const getSuiviIndicateurActiviteFormConfigForSuivi = (
  localites: Localite[] = []
): FormConfig => ({
  fields: getSuiviIndicateurActiviteFormConfig()
    .fields.filter((f) => f.name !== 'indicateur_activite')
    .map((field) =>
      field.name === 'localite'
        ? {
            ...field,
            label: 'Commune',
            options: localites.map((l) => ({
              value: l.code_loca,
              label: l.intitule_loca || l.code_loca,
            })),
          }
        : field
    ),
})
