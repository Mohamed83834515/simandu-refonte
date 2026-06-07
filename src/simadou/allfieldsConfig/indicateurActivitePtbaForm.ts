import type { FormConfig } from '../../Global/types/formConfig'
import type { UniteIndicateur } from '../allTypes/uniteIndicateur'

export const getIndicateurActivitePtbaFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'code_indicateur_activite',
      label: 'Code indicateur',
      type: 'text',
      placeholder: 'Ex: IND001, ACT01…',
      required: true,
      gridCols: 1,
    },
    {
      name: 'intitule_indicateur_tache',
      label: 'Intitulé indicateur',
      type: 'text',
      placeholder: "Intitulé de l'indicateur",
      required: true,
      gridCols: 2,
    },
    {
      name: 'activite_ptba',
      label: 'Activité PTBA',
      type: 'select',
      placeholder: 'Sélectionner une activité PTBA (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
    {
      name: 'code_indicateur_performance',
      label: 'Code indicateur performance',
      type: 'select',
      placeholder: 'Sélectionner un indicateur performance (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
    {
      name: 'abrege_unite',
      label: 'Unité indicateur',
      type: 'select',
      placeholder: 'Sélectionner une unité (optionnel)',
      required: false,
      options: [],
      gridCols: 1,
    },
  ],
})

/** Formulaire planification indicateur dans le modal PTBA (activité déjà connue). */
export const getIndicateurActivitePtbaFormConfigForPlanification = (
  unites: UniteIndicateur[] = []
): FormConfig => ({
  fields: getIndicateurActivitePtbaFormConfig()
    .fields.filter(
      (f) => f.name !== 'activite_ptba' && f.name !== 'code_indicateur_performance'
    )
    .map((field) =>
      field.name === 'abrege_unite'
        ? {
            ...field,
            options: unites.map((u) => ({
              value: u.id_unite,
              label: `${u.unite_ui} — ${u.definition_ui}`,
            })),
          }
        : field
    ),
})