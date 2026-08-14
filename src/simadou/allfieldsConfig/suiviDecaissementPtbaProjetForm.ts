import type { FormConfig } from '@/Global/types/formConfig'
import type { SelectOption } from '@/simadou/lib/suiviDecaissementPtbaProjetUtils'

export function getSuiviDecaissementPtbaProjetFormConfig({
  regionOptions,
  typePartOptions,
}: {
  regionOptions: SelectOption[]
  typePartOptions: SelectOption[]
}): FormConfig {
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
        name: 'region',
        label: 'Zone',
        type: 'select',
        placeholder: 'Sélectionner une zone',
        required: true,
        options: regionOptions,
        gridCols: 2,
      },
      {
        name: 'type_part',
        label: 'Financement',
        type: 'select',
        placeholder: 'Sélectionner un financement',
        required: true,
        options: typePartOptions,
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
