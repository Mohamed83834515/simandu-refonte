import type { FormConfig, SelectOption } from '@/Global/types/formConfig'
import type { UGL } from '@/simadou/allTypes'

function uglOptions(ugls: UGL[]): SelectOption[] {
  return ugls.map((item) => ({ value: item.id_ugl, label: item.nom_ugl }))
}


export const getContratPerformanceFormConfig = (
  ugls: UGL[] = [],
): FormConfig => ({
  steps: [
    { step: 1, title: 'Informations générales' },
    { step: 2, title: 'Cadre et suivi' },
  ],
  fields: [
    {
      name: 'code_contrat',
      label: 'Code du contrat',
      type: 'text',
      placeholder: 'Ex : CP-001',
      required: true,
      formStep: 1,
      gridCols: 2,
    },
    {
      name: 'intitule_contrat',
      label: 'Intitulé du contrat',
      type: 'textarea',
      placeholder: 'Intitulé du contrat de performance',
      required: true,
      formStep: 1,
      gridCols: 1,
    },
    {
      name: 'signataire_ministere',
      label: 'Signataire du ministère',
      type: 'text',
      placeholder: 'Nom du signataire',
      required: true,
      formStep: 1,
      gridCols: 2,
    },
    {
      name: 'date_signature',
      label: 'Date de signature',
      type: 'date',
      required: true,
      formStep: 1,
      gridCols: 2,
    },
    {
      name: 'date_debut',
      label: 'Date de début',
      type: 'date',
      required: true,
      formStep: 1,
      gridCols: 2,
    },
    {
      name: 'date_fin',
      label: 'Date de fin',
      type: 'date',
      required: true,
      formStep: 1,
      gridCols: 2,
    },
    {
      name: 'structure',
      label: 'Direction / Services',
      type: 'select',
      placeholder: 'Sélectionner une UGL',
      required: true,
      options: uglOptions(ugls),
      formStep: 2,
      gridCols: 2,
    },
    {
      name: 'note_globale',
      label: 'Note globale',
      type: 'number',
      placeholder: 'Ex : 0.2',
      formStep: 2,
      gridCols: 2,
    },
    {
      name: 'appreciation',
      label: 'Appréciation',
      type: 'select',
      placeholder: 'Ex : excellent',
      options: [
        { value: 'excellent', label: 'Excellent' },
        { value: 'très_bien', label: 'Très bien' },
        { value: 'bien', label: 'Bien' },
        { value: 'assez_bien', label: 'Assez bien' },
        { value: 'passable', label: 'Passable' },
        { value: 'non_satisfaisant', label: 'Non satisfaisant' },
      ],
      formStep: 2,
      gridCols: 2,
    },
    {
      name: 'observation_globale',
      label: 'Observation globale',
      type: 'textarea',
      placeholder: 'Observation globale',
      formStep: 2,
      gridCols: 1,
    },
  ],
})
