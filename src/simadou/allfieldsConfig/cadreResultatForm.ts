import type { FormConfig, SelectOption } from '../../Global/types/formConfig'

export const getCadreResultatFormConfigForDialog = ({
  parentLabel,
  parentOptions,
  showParent,
  codeLength,
}: {
  parentLabel: string
  parentOptions: SelectOption[]
  showProjet?: boolean
  showParent: boolean
  codeLength: number
}): FormConfig => ({
  fields: [
    {
      name: 'code_cr',
      label: `Code du cadre (exactement ${codeLength} caractères)`,
      type: 'text',
      placeholder: `Code de ${codeLength} caractères`,
      required: true,
      maxLength: codeLength,
      gridCols: 2,
    },
    {
      name: 'abgrege_cr',
      label: 'Abrégé',
      type: 'text',
      placeholder: 'Abrégé du cadre',
      required: true,
      gridCols: 2, 
    },
    {
      name: 'intutile_cr',
      label: 'Intitulé du cadre',
      type: 'textarea',
      placeholder: 'Intitulé complet du cadre de résultat',
      required: true,
      maxLength: 200,
      gridCols: 1,
    },
    ...(showParent
      ? [
          {
            name: 'parent_cr',
            label: parentLabel || 'Parent',
            type: 'select' as const,
            placeholder: `Sélectionnez un ${parentLabel}`,
            required: false,
            options: parentOptions,
            gridCols: 2 as const,
          },
        ]
      : []),
  ],
})
