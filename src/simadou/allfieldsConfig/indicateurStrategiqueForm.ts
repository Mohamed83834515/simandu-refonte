import type { FormConfig, SelectOption } from '@/Global/types/formConfig'
import { PERIODICITE_OPTIONS } from './periodiciteOptions'
import { buildAnneeCibleOptions } from './cibleCmrProjetForm'

export function getIndicateurStrategiqueFormConfigForDialog({
  cadreOptions,
  acteurOptions,
  personnelOptions,
  isLoadingCadres,
  isLoadingActeurs,
  isLoadingPersonnels,
}: {
  cadreOptions: SelectOption[]
  acteurOptions: SelectOption[]
  personnelOptions: SelectOption[]
  isLoadingCadres?: boolean
  isLoadingActeurs?: boolean
  isLoadingPersonnels?: boolean
}): FormConfig {
  return {
    fields: [
      {
        name: 'code_indicateur_istr',
        label: 'Code',
        type: 'text',
        placeholder: 'Ex: IND-01',
        required: true,
        gridCols: 2,
      },
      {
        name: 'code_istr',
        label: 'Cadre stratégique',
        type: 'select',
        placeholder: 'Sélectionner un cadre',
        required: true,
        options: cadreOptions,
        isLoading: isLoadingCadres,
        gridCols: 2,
      },
      {
        name: 'intitule_indicateur_istr',
        label: 'Intitulé',
        type: 'text',
        placeholder: "Entrez l'intitulé",
        required: true,
        gridCols: 1,
      },
      {
        name: 'description_istr',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Description détaillée',
        rows: 2,
        required: true,
        gridCols: 1,
      },
      {
        name: 'periodicite_iop',
        label: 'Périodicité',
        type: 'select',
        placeholder: 'Sélectionner une périodicité…',
        required: false,
        options: PERIODICITE_OPTIONS,
        gridCols: 2,
      },
      {
        name: 'source_istr',
        label: 'Source',
        type: 'text',
        placeholder: 'Source des données',
        required: false,
        gridCols: 2,
      },
      {
        name: 'responsable_istr',
        label: 'Responsable',
        type: 'select',
        placeholder: 'Sélectionner un responsable',
        required: true,
        options: personnelOptions,
        isLoading: isLoadingPersonnels,
        gridCols: 2,
      },
      {
        name: 'structure_istr',
        label: 'Structure',
        type: 'select',
        placeholder: 'Sélectionner une structure',
        required: false,
        options: acteurOptions,
        isLoading: isLoadingActeurs,
        gridCols: 2,
      },
    ],
  }
}

export function getCibleIndicateurStrategiqueFormConfigForDialog({
  anneeOptions = buildAnneeCibleOptions(),
  uglOptions,
  isLoadingUgls,
}: {
  anneeOptions?: SelectOption[]
  uglOptions: SelectOption[]
  isLoadingUgls?: boolean
}): FormConfig {
  return {
    fields: [
      {
        name: 'annee',
        label: 'Année',
        type: 'select',
        placeholder: "Sélectionner l'année",
        required: true,
        options: anneeOptions,
        gridCols: 2,
      },
      {
        name: 'valeur_cible_indcateur_istr',
        label: 'Valeur cible',
        type: 'number',
        placeholder: '0',
        required: true,
        min: 0,
        gridCols: 2,
      },
      {
        name: 'code_ug',
        label: 'Unité de gestion',
        type: 'select',
        placeholder: 'Sélectionner une UGL',
        required: true,
        options: uglOptions,
        isLoading: isLoadingUgls,
        gridCols: 1,
      },
    ],
  }
}
