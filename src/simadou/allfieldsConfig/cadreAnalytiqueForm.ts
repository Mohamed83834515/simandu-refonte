import type { FormConfig, SelectOption } from '@/Global/types/formConfig'

/** Formulaire cadre analytique — layout compact 2 colonnes (dialog). */
export function getCadreAnalytiqueFormConfigForDialog({
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
        name: 'code_ca',
        label: `Code du cadre (exactement ${codeLength} caractères)`,
        type: 'text',
        placeholder: `Code de ${codeLength} caractères`,
        required: true,
        maxLength: codeLength,
        gridCols: 2,
      },
      {
        name: 'partenaire_ca',
        label: 'Acteur(s)',
        type: 'multiselect',
        placeholder: 'Sélectionner un ou plusieurs acteurs',
        required: false,
        options: acteurOptions,
        isLoading: isLoadingActeurs,
        gridCols: 2,
      },
      {
        name: 'intutile_ca',
        label: 'Intitulé',
        type: 'textarea',
        placeholder: "Entrez l'intitulé",
        required: true,
        gridCols: 1,
      },
      {
        name: 'abgrege_ca',
        label: 'Abrégé',
        type: 'text',
        placeholder: "Entrez l'abrégé",
        required: false,
        gridCols: 2,
      },
      {
        name: 'cout_axe',
        label: 'Budget (GNF)',
        type: 'number',
        placeholder: 'Saisissez le budget ',
        required: true,
        min: 0,
        step: 0.01,
        gridCols: 2,
      },
      ...(showParent
        ? [
            {
              name: 'parent_ca',
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
