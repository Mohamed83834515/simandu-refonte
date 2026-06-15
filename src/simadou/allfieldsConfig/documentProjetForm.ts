import type { FormConfig } from '@/Global/types/formConfig'

export function getDocumentProjetFormConfig(isEdit = false): FormConfig {
  return {
    fields: [
      {
        name: 'document',
        label: 'Document',
        type: 'file',
        accept:
          'application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip',
        maxSize: 20,
        helperText: 'Formats courants acceptés (max 20 Mo)',
        required: !isEdit,
        gridCols: 1,
      },
      {
        name: 'description_document',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Description du document (optionnel)',
        required: false,
        gridCols: 1,
      },
    ],
  }
}
