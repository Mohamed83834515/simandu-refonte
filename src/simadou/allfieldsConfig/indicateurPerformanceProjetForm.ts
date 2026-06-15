import { FormConfig } from '@/Global/types/formConfig'

export const getIndicateurPerformanceProjetFormConfigForDialog = ({
  isEditing,
  uniteOptions,
  isLoadingUnites,
}: {
  isEditing: boolean
  uniteOptions: { value: number; label: string }[]
  isLoadingUnites: boolean
}): FormConfig => ({
  fields: [
    {
      name: 'code_indicateur_performance',
      label: 'Code indicateur',
      type: 'text',
      placeholder: 'Ex: IND001, KPI-01...',
      required: true,
      disabled: isEditing,
      gridCols: 2,
    },
    {
      name: 'unite_indicateur_performance',
      label: 'Unité de mesure',
      type: 'select',
      placeholder: isLoadingUnites ? 'Chargement...' : 'Sélectionner une unité',
      required: true,
      options: uniteOptions,
      isLoading: isLoadingUnites,
      gridCols: 2,
    },

    {
      name: 'intitule_indicateur_tache',
      label: 'Intitulé',
      type: 'textarea',
      placeholder: 'Description de l\'indicateur',
      required: true,
      gridCols: 1,
    },
    
  ],
})