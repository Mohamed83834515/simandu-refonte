import type { FormConfig } from '@/Global/types/formConfig'

export function getDossierProjetFormConfig(): FormConfig {
  return {
    fields: [
      {
        name: 'nom_dossier',
        label: 'Nom du dossier',
        type: 'text',
        placeholder: 'Ex. Rapports annuels',
        required: true,
        gridCols: 1,
      },
      {
        name: 'description_dossier',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Description du dossier (optionnel)',
        required: false,
        gridCols: 1,
      },
    ],
  }
}
