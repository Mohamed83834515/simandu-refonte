import type { FormConfig } from '@/Global/types/formConfig'

export function getSuiviTacheActiviteProjetFormConfig(): FormConfig {
  return {
    fields: [
      {
        name: 'date_reele',
        label: 'Date réelle',
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'proportion_realisee',
        label: 'Proportion réalisée',
        type: 'number',
        placeholder: '0 – 100',
        required: true,
        min: 0,
        max: 100,
        step: 1,
        helperText: 'Pourcentage de réalisation de la tâche (0 à 100 %)',
        gridCols: 2,
      },
      {
        name: 'valide',
        label: 'Suivi validé',
        type: 'switch',
        helperText: 'Indique que le suivi de cette tâche est validé',
        className: 'field-card',
        gridCols: 1,
      },
      {
        name: 'observation_suivi',
        label: 'Observation suivi',
        type: 'textarea',
        placeholder: 'Observations sur le suivi…',
        rows: 2,
        required: true,
        gridCols: 1,
        className: 'resize-y',
      },
    ],
  }
}
