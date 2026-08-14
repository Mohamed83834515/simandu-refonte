import type { FormConfig, SelectOption } from '../../Global/types/formConfig'
import { TACHE_PROPORTION_TOTAL_MAX } from '@/simadou/lib/tacheActivitePtbaUtils'

export function getTacheActivitePtbaFormConfigForDialog({
  personnelOptions,
  isLoadingPersonnels,
  responsableAsText = false,
  maxProportion = TACHE_PROPORTION_TOTAL_MAX,
}: {
  personnelOptions: SelectOption[]
  isLoadingPersonnels?: boolean
  responsableAsText?: boolean
  /** Max allowed for this create/edit (remaining under 100%). */
  maxProportion?: number
}): FormConfig {
  const cappedMax = Math.max(
    0,
    Math.min(TACHE_PROPORTION_TOTAL_MAX, maxProportion)
  )

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
      label: 'Proportion (%)',
      type: 'number',
      placeholder: `0 – ${cappedMax}`,
      required: true,
      min: 0,
      max: cappedMax,
      helperText:
        cappedMax < TACHE_PROPORTION_TOTAL_MAX
          ? `Maximum disponible : ${cappedMax}% (total des tâches ≤ ${TACHE_PROPORTION_TOTAL_MAX}%)`
          : `Total des proportions des tâches ≤ ${TACHE_PROPORTION_TOTAL_MAX}%`,
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
