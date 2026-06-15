import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

export const getActiviteProjetFormConfigForDialog = ({
  fixedCodeLength,
  parentNiveauLabel,
  showParent,
  parentOptions,
  activiteProgrammeOptions,
  isLoadingActivitesProgramme,
}: {
  fixedCodeLength: number;
  parentNiveauLabel: string;
  showParent: boolean;
  parentOptions: SelectOption[];
  activiteProgrammeOptions: SelectOption[];
  projetOptions: SelectOption[];
  isLoadingActivitesProgramme?: boolean;
  isLoadingProjets?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "code_activite_projet",
      label: `Code de l'activité (${fixedCodeLength} caractère(s) requis)`,
      type: "text",
      placeholder: `Code de ${fixedCodeLength} caractère(s) exactement`,
      required: true,
      maxLength: fixedCodeLength,
      gridCols: 2,
    },
    {
      name: "intitule_activite_projet",
      label: "Intitulé de l'activité",
      type: "text",
      placeholder: "Ex: Formation des agriculteurs",
      required: true,
      gridCols: 2,
    },
    ...(showParent
      ? [
          {
            name: "parent_activite_projet",
            label: parentNiveauLabel,
            type: "select" as const,
            placeholder: "Sélectionner une activité parent",
            required: true,
            options: parentOptions,
            gridCols: 2 as const,
          },
        ]
      : []),
    {
      name: "code_activite_programme",
      label: "Activité programme",
      type: "select",
      placeholder: "Sélectionner une activité programme",
      required: false,
      options: activiteProgrammeOptions,
      isLoading: isLoadingActivitesProgramme,
      gridCols: 2,
    },
  ],
});
