import type { FormConfig } from '@/Global/types/formConfig'
import { typeMissionSupervisionOptions } from '../schemas/missionRecommandationSchemas'
export function getMissionSupervisionProjetFormConfig(): FormConfig {
  return {
    fields: [
      {
        name: 'code_ms',
        label: 'Code mission',
        type: 'text',
        placeholder: 'Ex: MS-001',
        required: true,
        maxLength: 50,
        gridCols: 2,
        formStep: 1,
      },
      {
        name: 'type_mission',
        label: 'Type de mission',
        type: 'select',
        placeholder: 'Sélectionner un type',
        required: true,
        options: typeMissionSupervisionOptions,
        gridCols: 2,
      },
      {
        name: 'objet',
        label: 'Objet',
        type: 'textarea',
        placeholder: 'Objet de la mission',
        rows: 3,
        gridCols: 1,
      },
      {
        name: 'debut',
        label: 'Date de début',
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'fin',
        label: 'Date de fin',
        type: 'date',
        required: true,
        gridCols: 2,
      },
      {
        name: 'resume',
        label: 'Résumé',
        type: 'textarea',
        placeholder: 'Résumé de la mission',
        rows: 3,
        gridCols: 1,
      },
      // {
      //   name: 'projection',
      //   label: 'Projection',
      //   type: 'textarea',
      //   placeholder: 'Projection ou suites attendues',
      //   rows: 3,
      //   gridCols: 1,
      //   formStep: 2,
      // },
      {
        name: 'observation',
        label: 'Observation',
        type: 'textarea',
        placeholder: 'Observations complémentaires',
        rows: 3,
        gridCols: 1,
      },
      // {
      //   name: 'document',
      //   label: 'Document',
      //   type: 'file',
      //   accept: 'application/pdf,image/*,.doc,.docx',
      //   maxSize: 10,
      //   helperText: 'PDF, DOC ou DOCX — max. 10 Mo',
      //   gridCols: 1,
      // },
    ],
  }
}
