import type { FormConfig, SelectOption } from '@/Global/types/formConfig'

export function getCadreStrategiqueFormConfigForDialog({
  parentOptions,
  acteurOptions,
  isLoadingActeurs,
  showParent,
  parentLabel = 'Parent',
  parentDisabled = false,
  codeLength,
}: {
  parentOptions: SelectOption[]
  acteurOptions: SelectOption[]
  isLoadingActeurs?: boolean
  showParent: boolean
  parentLabel?: string
  parentDisabled?: boolean
  codeLength: number
}): FormConfig {
  return {
    fields: [
      {
        name: 'code_cs',
        label: `Code du cadre (exactement ${codeLength} caractères)`,
        type: 'text',
        placeholder: `Code de ${codeLength} caractères`,
        required: true,
        maxLength: codeLength,
        gridCols: 2,
      },
      {
        name: 'partenaire_cs',
        label: 'Acteur(s)',
        type: 'multiselect',
        placeholder: 'Sélectionner un ou plusieurs acteurs',
        required: false,
        options: acteurOptions,
        isLoading: isLoadingActeurs,
        gridCols: 2,
      },
      {
        name: 'intutile_cs',
        label: 'Intitulé',
        type: 'textarea',
        placeholder: "Entrez l'intitulé",
        required: true,
        gridCols: 1,
      },
      {
        name: 'abgrege_cs',
        label: 'Abrégé',
        type: 'text',
        placeholder: "Entrez l'abrégé",
        required: true,
        gridCols: 2,
      },
      ...(showParent
        ? [
            {
              name: 'parent_cs',
              label: parentLabel,
              type: 'select' as const,
              placeholder:
                parentOptions.length > 0
                  ? '-- Choisir un parent --'
                  : 'Aucun parent disponible',
              required: false,
              options: parentOptions,
              disabled: parentDisabled || parentOptions.length === 0,
              gridCols: 2 as const,
            },
          ]
        : []),
    ],
  }
}
