import type { FormConfig, SelectOption } from '@/Global/types/formConfig'

export const getConventionFormConfig = (
  partenaireOptions: SelectOption[] = [],
  isEdit = false
): FormConfig => ({
  fields: [
    {
      name: 'code_convention',
      label: 'Code convention',
      type: 'text',
      placeholder: 'Ex: CONV-2024-001',
      required: true,
      gridCols: 2,
    },
    {
      name: 'reference_conv',
      label: 'Référence',
      type: 'text',
      placeholder: 'Référence de la convention',
      required: true,
      gridCols: 2,
    },
    {
      name: 'intutile_conv',
      label: 'Intitulé',
      type: 'textarea',
      placeholder: 'Intitulé de la convention',
      required: true,
      gridCols: 1,
    },
    {
      name: 'montant_conv',
      label: 'Montant (GNF)',
      type: 'number',
      placeholder: 'Montant en GNF',
      required: true,
      gridCols: 2,
    },
    {
      name: 'date_signature_conv',
      label: 'Date de signature',
      type: 'date',
      required: true,
      gridCols: 2,
    },
    {
      name: 'partenaire_conv',
      label: 'Partenaire financier',
      type: 'select',
      placeholder: 'Sélectionner un partenaire financier',
      required: false,
      options: partenaireOptions,
      gridCols: 1,
    },
    {
      name: 'document_fichier',
      label: 'Document',
      type: 'file',
      accept: 'application/pdf,image/*,.doc,.docx',
      maxSize: 10,
      helperText: 'PDF, images ou documents (max 10 Mo)',
      required: !isEdit,
      gridCols: 1,
    },
  ],
})
