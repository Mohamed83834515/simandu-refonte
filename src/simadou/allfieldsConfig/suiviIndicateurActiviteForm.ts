import { FormConfig } from '@/Global/types/formConfig'
import type { Localite } from '@/simadou/allTypes'

export const getSuiviIndicateurActiviteFormConfigForSuivi = ({
  localites,
  isLoadingLocalites,
  indicateurOptions,
}: {
  localites: Localite[]
  isLoadingLocalites: boolean
  indicateurOptions: { value: string; label: string }[]
}): FormConfig => ({
  fields: [
    {
      name: 'date_suivi_indicateur',
      label: 'Date de suivi',
      type: 'date',
      required: true,
      gridCols: 2,
    },
    {
      name: 'valeur_suivi_indicateur',
      label: 'Valeur mesurée',
      type: 'number',
      placeholder: 'Ex: 150, 75.5...',
      required: true,
      min: 0,
      gridCols: 2,
    },
    {
      name: 'localite',
      label: 'Localité',
      type: 'select',
      placeholder: isLoadingLocalites ? 'Chargement...' : 'Sélectionner une localité',
      required: true,
      options: localites.map(l => ({
        value: String(l.id_loca),
        label: l.intitule_loca,
      })),
      isLoading: isLoadingLocalites,
      gridCols: 2,
    },
    {
      name: 'indicateur_activite',
      label: 'Indicateur',
      type: 'select',
      placeholder: 'Sélectionner un indicateur (optionnel)',
      required: false,
      options: indicateurOptions,
      gridCols: 2,
    },
  ],
})