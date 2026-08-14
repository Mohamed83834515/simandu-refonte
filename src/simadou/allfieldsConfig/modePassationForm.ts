import type { FormConfig } from '@/Global/types/formConfig'

export const getModePassationFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'code_mode_passation',
      label: 'Code',
      type: 'text',
      placeholder: 'Ex: AO, AON, ED...',
      required: true,
      gridCols: 1,
    },
    {
      name: 'intitule_mode_passation',
      label: 'Intitulé',
      type: 'textarea',
      placeholder: 'Intitulé du mode de passation',
      required: true,
      gridCols: 1,
    },
  ],
})
