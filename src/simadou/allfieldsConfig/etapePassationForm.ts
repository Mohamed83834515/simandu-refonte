import type { FormConfig } from '../../Global/types/formConfig'

export const getEtapePassationFormConfig = (
  groupeOptions: { value: string; label: string }[],
): FormConfig => ({
  fields: [
    {
      name: 'etape',
      label: "Intitulé de l'étape",
      type: 'text',
      required: true,
    },
    {
      name: 'groupe_etape',
      label: "Groupe d'étape",
      type: 'select',
      required: false,
      options: groupeOptions,
    },
    {
      name: 'date_prevu',
      label: 'Date prévue',
      type: 'date',
      required: false,
    }
  ],
})