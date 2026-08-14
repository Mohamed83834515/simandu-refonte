import type { FormConfig } from '@/Global/types/formConfig'

export function getSuiviDecaissementConventionFormConfig(
  isEdit = false
): FormConfig {
  return {
    fields: [
      {
        name: 'date_suivi_dec',
        label: 'Date',
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'montant_decaisse',
        label: 'Montant décaissé',
        type: 'number',
        placeholder: '0',
        required: true,
        min: 0,
        gridCols: 2,
      },
      {
        name: 'observation',
        label: 'Observation',
        type: 'textarea',
        placeholder: 'Observation…',
        required: true,
        rows: 4,
        maxLength: 2000,
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
  }
}
