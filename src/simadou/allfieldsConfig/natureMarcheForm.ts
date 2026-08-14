import type { FormConfig } from '@/Global/types/formConfig'

export const getNatureMarcheFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'code_nature_marche',
      label: 'Code',
      type: 'text',
      placeholder: 'Ex: TRX, FOUR, SERV...',
      required: true,
      gridCols: 1,
    },
    {
      name: 'intitule_nature_marche',
      label: 'Intitulé',
      type: 'textarea',
      placeholder: 'Intitulé de la nature de marché',
      required: true,
      gridCols: 1,
    },
  ],
})
