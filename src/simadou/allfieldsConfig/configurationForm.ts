import type { FormConfig } from '@/Global/types/formConfig'

export const getCreateConfigurationFormConfig = (): FormConfig => ({
  layout: 'grid',
  columns: 2,
  fields: [
    {
      name:        'structure_name',
      label:       'Nom de la structure',
      type:        'text',
      placeholder: 'Cellule Exécution des Projets',
      required:    true,
      colSpan:     'full',
    },
    {
      name:        'structure_sigle',
      label:       'Sigle de la structure',
      type:        'text',
      placeholder: 'CEP',
      required:    true,
      gridCols:    1,
    }
    
    
  ],
})