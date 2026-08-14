import { FormConfig } from '@/Global/types/formConfig'

const typeOptions = [
  {
    value: 1,
    label: 'Performance',
  },
  {
    value: 0,
    label: 'Gestion',
  },
]

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
      name: 'intitule_indicateur_tache',
      label: 'Intitulé indicateur',
      type: 'text',
      placeholder: "Intitulé de la tâche ou de l'indicateur",
      required: true,
      gridCols: 1,
    },
    {
      name: 'code_indicateur_performance',
      label: 'Code indicateur',
      type: 'text',
      placeholder: 'Ex: IND001, KPI-01...',
      required: true,
      disabled: isEditing,
      gridCols: 3,
    },
    {
      name: 'unite_indicateur_performance',
      label: 'Unité de mesure',
      type: 'select',
      placeholder: isLoadingUnites ? 'Chargement...' : 'Sélectionner une unité',
      required: true,
      options: uniteOptions,
      isLoading: isLoadingUnites,
      gridCols: 3,
    },
    {
      name: 'type_ind',
      label: "Type d'indicateur",
      type: 'select',
      placeholder: 'Sélectionner un type',
      required: true,
      options: typeOptions,
      gridCols: 3,
    },
  ],
})
