import type { FormConfig } from '@/Global/types/formConfig'

export function getSuiviDecaissementPtbaProjetFormConfig(): FormConfig {
  return {
    fields: [
      {
        name: 'date_suivi_dec',
        label: 'Date',
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'montant_decaisse',
        label: 'Montant',
        type: 'number',
        placeholder: '0',
        required: true,
        min: 0,
        gridCols: 2,
      },
      {
        name: 'observation',
        label: 'Observation',
        type: 'textarea',
        placeholder: 'Observation…',
        required: true,
        rows: 4,
        maxLength: 2000,
        gridCols: 1,
      },
    ],
  }
}
