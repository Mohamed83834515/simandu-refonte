import { FormConfig } from '@/Global/types/formConfig'

export const getSourceFinancementProjetFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'intitule_source_financement',
      label: 'Intitulé',
      type: 'textarea',
      placeholder: 'Ex: Financement BAD 2024',
      required: true,
      gridCols: 1,
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
      options: [],
      gridCols: 2,
    }
  ],
})