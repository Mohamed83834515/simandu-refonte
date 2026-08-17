import type { FormConfig } from '../../Global/types/formConfig'

export const getEtapePassationFormConfig = (
  groupeOptions: { value: string; label: string }[],
  isEditing: boolean
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
    },
    {
      name: 'date_realise',
      label: 'Date réalisée',
      type: 'date',
      required: false,
    },
    ...(!isEditing
      ? [
        {
          name: 'fichiers',
          label: 'Fichiers',
          type: 'file' as const,
          multiple: true,
          accept: 'application/pdf,image/*,.doc,.docx',
          maxSize: 10,
          helperText: 'PDF, images ou documents (max 10 Mo par fichier)',
          required: false,
        },
      ]
      : []),
  ],
})