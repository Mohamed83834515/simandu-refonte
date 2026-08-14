import type { FormConfig, SelectOption } from '../../Global/types/formConfig'

export const getIndicateurContratFormConfig = ({
  clcpOptions,
  uniteOptions,
  isLoadingClcp = false,
  isLoadingUnites = false,
  hideClcpField = false,
}: {
  clcpOptions: SelectOption[]
  uniteOptions: SelectOption[]
  isLoadingClcp?: boolean
  isLoadingUnites?: boolean
  hideClcpField?: boolean
  isEdit?: boolean
}): FormConfig => ({
  fields: [
    ...(hideClcpField
      ? [
          {
            name: 'clcp',
            label: 'Cadre logique',
            type: 'hidden' as const,
          },
        ]
      : [
          {
            name: 'clcp',
            label: 'Cadre logique',
            type: 'select' as const,
            placeholder: 'Sélectionnez un cadre logique',
            required: true,
            options: clcpOptions,
            isLoading: isLoadingClcp,
            gridCols: 2 as const,
          },
        ]),
    {
      name: 'valeur_reference',
      label: 'Valeur de référence',
      type: 'number',
      required: true,
      gridCols: 2,
    },
    {
      name: 'intitule_indicateur',
      label: "Intitulé de l'indicateur",
      type: 'text',
      placeholder: 'Intitulé complet',
      required: true,
      maxLength: 200,
      gridCols: 2,
    },
    {
      name: 'unite',
      label: 'Unité',
      type: 'select',
      placeholder: 'Sélectionnez une unité',
      required: true,
      options: uniteOptions,
      isLoading: isLoadingUnites,
      gridCols: 2,
    },
    {
      name: 'cible_t1',
      label: 'Cible T1',
      type: 'text',
      gridCols: 2,
    },
    {
      name: 'cible_t2',
      label: 'Cible T2',
      type: 'text',
      gridCols: 2,
    },
    {
      name: 'cible_t3',
      label: 'Cible T3',
      type: 'text',
      gridCols: 2,
    },
    {
      name: 'cible_t4',
      label: 'Cible T4',
      type: 'text',
      gridCols: 2,
    },
    {
      name: 'moyen_verification',
      label: 'Moyen de vérification',
      type: 'file',
      accept: 'application/pdf,image/*,.doc,.docx',
      maxSize: 10,
      helperText: 'PDF, images ou documents (max 10 Mo)',
      gridCols: 1,
    },
  ],
})
