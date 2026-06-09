import { FormConfig } from '@/Global/types/formConfig'

export const getSourceFinancementProjetFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'code_source_financement',
      label: 'Code source',
      type: 'text',
      placeholder: 'Ex: SF001, BAD-2024...',
      required: true,
      gridCols: 2,
    },
    {
      name: 'intitule_source_financement',
      label: 'Intitulé',
      type: 'text',
      placeholder: 'Ex: Financement BAD 2024',
      required: true,
      gridCols: 2,
    },
    {
      name: 'Numero_reference_sf',
      label: 'Numéro référence',
      type: 'text',
      placeholder: 'Référence automatique',
      required: false,
      gridCols: 2,
    },
    {
      name: 'montant_source_financement',
      label: 'Montant',
      type: 'number',
      placeholder: 'Ex: 100000000',
      required: true,
      gridCols: 2,
    },
    {
      name: 'date_signature_convention',
      label: 'Date signature convention',
      type: 'date',
      required: true,
      gridCols: 2,
    },
    {
      name: 'code_partenaire',
      label: 'Partenaire',
      type: 'select',
      placeholder: 'Sélectionner un partenaire',
      required: true,
      options: [
        { value: 'PART01', label: 'Partenaire 1' },
        { value: 'PART02', label: 'Partenaire 2' },
      ],
      gridCols: 2,
    }
  ],
})