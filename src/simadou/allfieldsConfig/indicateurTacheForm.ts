import type { FormConfig, SelectOption } from '../../Global/types/formConfig'

export function getIndicateurTacheFormConfigForDialog({
  indicateurCmrOptions,
  uniteIndicateurOptions,
  isLoadingIndicateurCmrs,
  isLoadingUnites,
}: {
  indicateurCmrOptions: SelectOption[]
  uniteIndicateurOptions: SelectOption[]
  isLoadingIndicateurCmrs?: boolean
  isLoadingUnites?: boolean
}): FormConfig {
  return {
  fields: [
    {
      name: 'intitule_indicateur_tache',
      label: 'Intitulé indicateur tâche',
      type: 'textarea',
      placeholder: "Intitulé de l'indicateur",
      required: true,
      gridCols: 1,
    },
    {
      name: 'unite_ind_tache',
      label: 'Unité indicateur tâche',
      type: 'select',
      options: uniteIndicateurOptions,
      placeholder: 'Ex: Kg, %, Nbre, FCFA...',
      required: true,
      isLoading: isLoadingUnites,
      gridCols: 2,
    },
    {
      name: 'code_indicateur_ptba',
      label: 'Code indicateur PTBA',
      type: 'text',
      placeholder: 'Ex: IND001, PTBA01...',
      required: true,
      gridCols: 2,
    },
    {
      name: 'indicateur_cmr',
      label: 'Indicateur CMR',
      type: 'select',
      placeholder: 'Sélectionner un indicateur CMR',
      required: true,
      options: indicateurCmrOptions,
      isLoading: isLoadingIndicateurCmrs,
      gridCols: 2,
    },
    {
      name: 'trimestre_1',
      label: 'Trimestre 1',
      type: 'text',
      placeholder: 'Ex: 100, 75%, 2000...',
      gridCols: 2,
    },
    {
      name: 'trimestre_2',
      label: 'Trimestre 2',
      type: 'text',
      placeholder: 'Ex: 100, 75%, 2000...',
      gridCols: 2,
    },
    {
      name: 'trimestre_3',
      label: 'Trimestre 3',
      type: 'text',
      placeholder: 'Ex: 100, 75%, 2000...',
      gridCols: 2,
    },
    {
      name: 'trimestre_4',
      label: 'Trimestre 4',
      type: 'text',
      placeholder: 'Ex: 100, 75%, 2000...',
      gridCols: 2,
    },
  ],
  }
}
