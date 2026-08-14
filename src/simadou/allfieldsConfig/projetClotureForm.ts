import { FormConfig } from "@/Global/types/formConfig";

export const getProjetClotureFormConfig = (): FormConfig => ({
  fields: [
    {
      name: 'is_cloture',
      label: 'Projet clôturé',
      type: 'switch',
      helperText: 'Un projet clôturé ne sera plus l\'objet d\'un suivi.',
      className: 'field-card',
      gridCols: 1,
    },
    {
      name: 'date_cloture_projet',
      label: 'Date de clôture',
      type: 'date',
      required: true,
      gridCols: 1,
    },
  ],
})