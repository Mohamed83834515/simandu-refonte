import type { FormConfig } from '@/Global/types/formConfig'
import { TYPE_FINANCEMENT_OPTIONS } from '@/simadou/lib/financementProjetUtils'

export function getFinancementProjetFormConfig(
  bailleurOptions: { value: number; label: string }[]
): FormConfig {
  return {
    fields: [
      {
        name: 'code_type',
        label: 'Code',
        type: 'text',
        placeholder: 'Ex. TP-001',
        required: true,
        gridCols: 2,
      },
      {
        name: 'intitule',
        label: 'Intitulé',
        type: 'text',
        placeholder: 'Intitulé du financement',
        required: true,
        gridCols: 2,
      },
      {
        name: 'type_financement',
        label: 'Type de financement',
        type: 'select',
        placeholder: 'Sélectionner un type',
        required: true,
        options: TYPE_FINANCEMENT_OPTIONS,
        gridCols: 2,
      },
      {
        name: 'bailleur',
        label: 'Bailleur',
        type: 'select',
        placeholder: 'Sélectionner un bailleur',
        required: true,
        options: bailleurOptions,
        gridCols: 2,
      },
      {
        name: 'montant',
        label: 'Montant(GNF)',
        type: 'number',
        placeholder: 'Ex. 1000000',
        required: true,
        gridCols: 2,
      },
      {
        name: 'date_accord',
        label: "Date d'accord",
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'observation',
        label: 'Observation',
        type: 'textarea',
        placeholder: 'Observation (optionnel)',
        required: false,
        gridCols: 1,
      },
    ],
  }
}
