import type { FormConfig } from '@/Global/types/formConfig'

export function getTitrePersonnelFormConfig(): FormConfig {
  return {
    fields: [
      {
        name: 'libelle_titre',
        label: 'Libellé',
        type: 'text',
        placeholder: 'Ex : Monsieur, Madame, Docteur…',
        required: true,
        gridCols: 1,
      },
      {
        name: 'description_titre',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Description du titre…',
        required: false,
        gridCols: 1,
      },
    ],
  }
}
