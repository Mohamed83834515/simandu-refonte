import type { FormConfig, SelectOption } from '../../Global/types/formConfig'

export const getCadreLogiqueClcpFormConfig = ({
  parentLabel,
  parentOptions,
  showParent,
  codeLength,
}: {
  parentLabel: string
  parentOptions: SelectOption[]
  showParent: boolean
  codeLength: number
}): FormConfig => ({
  fields: [
    {
      name: 'code_clc',
      label: `Code du cadre (exactement ${codeLength} caractère(s))`,
      type: 'text',
      placeholder: `Code de ${codeLength} caractère(s)`,
      required: true,
      maxLength: codeLength,
      gridCols: showParent ? 2 : 1,
    },
    ...(showParent
      ? [
          {
            name: 'parent_clc',
            label: parentLabel || 'Parent',
            type: 'select' as const,
            placeholder: `Sélectionnez un ${parentLabel}`,
            required: false,
            options: parentOptions,
            gridCols: 2 as const,
          },
        ]
      : []),
    {
      name: 'niveau_clc',
      label: 'Niveau',
      type: 'hidden',
    },
    {
      name: 'intitule_clc',
      label: 'Intitulé du cadre',
      type: 'textarea',
      placeholder: 'Intitulé complet du cadre logique',
      required: true,
      maxLength: 200,
      gridCols: 1,
    },
  ],
})
