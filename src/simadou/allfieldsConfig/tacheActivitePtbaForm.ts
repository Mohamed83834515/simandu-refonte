import type { FormConfig, SelectOption } from '../../Global/types/formConfig'

export function getTacheActivitePtbaFormConfigForDialog({
  personnelOptions,
  isLoadingPersonnels,
  responsableAsText = false,
}: {
  personnelOptions: SelectOption[]
  isLoadingPersonnels?: boolean
  responsableAsText?: boolean
}): FormConfig {
  return {
  fields: [
    {
      name: 'id_activite',
      label: 'Activité',
      type: 'hidden',
    },
    {
      name: 'code_tache_gt',
      label: 'Code tâche',
      type: 'text',
      placeholder: 'Code de la tâche (max 200 caractères)',
      required: true,
      maxLength: 200,
      gridCols: 2,
    },
    {
      name: 'proportion_gt',
      label: 'Proportion',
      type: 'number',
      placeholder: 'Ex: 25%, 50%, 100%',
      required: true,
      maxLength: 10,
      gridCols: 2,
    },
    {
      name: 'intutile_tache_gt',
      label: 'Intitulé tâche',
      type: 'textarea',
      placeholder: 'Intitulé de la tâche (max 200 caractères)',
      required: true,
      cols: 1,
      maxLength: 200,
      gridCols: 1,
    },
    {
      name: 'date_debut_gt',
      label: 'Date début',
      type: 'date',
      placeholder: 'AAAA-MM-JJ',
      required: true,
      gridCols: 2,
    },
    {
      name: 'date_fin_gt',
      label: 'Date fin',
      type: 'date',
      placeholder: 'AAAA-MM-JJ',
      required: true,
      gridCols: 2,
    },
    {
      name: 'n_lot_gt',
      label: 'N° lot',
      type: 'number',
      placeholder: 'Numéro du lot',
      required: true,
      min: 1,
      gridCols: 2,
    },
    {
      name: 'responsable_gt',
      label: 'Responsable',
      type: responsableAsText ? 'text' : 'select',
      placeholder: responsableAsText
        ? 'Nom du responsable'
        : 'Sélectionner un responsable (optionnel)',
      required: false,
      ...(responsableAsText
        ? { maxLength: 100 }
        : {
            options: personnelOptions,
            isLoading: isLoadingPersonnels,
          }),
      gridCols: 2,
    },
  ],
  }
}
