import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

export const getIndicateurPerformanceProjetFormConfigForDialog = ({
  isEditing,
  activiteOptions,
  uniteOptions,
  projetOptions,
  isLoadingActivites,
  isLoadingUnites,
  isLoadingProjets,
}: {
  isEditing: boolean;
  activiteOptions: SelectOption[];
  uniteOptions: SelectOption[];
  projetOptions: SelectOption[];
  isLoadingActivites?: boolean;
  isLoadingUnites?: boolean;
  isLoadingProjets?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "code_indicateur_performance",
      label: "Code Indicateur",
      type: "text",
      placeholder: "Ex: IND-001",
      required: true,
      disabled: isEditing,
      gridCols: 1,
    },
    {
      name: "intitule_indicateur_tache",
      label: "Intitulé",
      type: "text",
      placeholder: "Description de l'indicateur…",
      required: true,
      gridCols: 1,
    },
    {
      name: "unite_indicateur_performance",
      label: "Unité de mesure",
      type: "select",
      placeholder: "Sélectionner une unité",
      required: false,
      options: uniteOptions,
      isLoading: isLoadingUnites,
      gridCols: 1,
    },
    {
      name: "code_activite_projet",
      label: "Activité Projet",
      type: "select",
      placeholder: "Sélectionner une activité",
      required: false,
      options: activiteOptions,
      isLoading: isLoadingActivites,
      gridCols: 1,
    },
    {
      name: "code_projet",
      label: "Projet",
      type: "select",
      placeholder: "Sélectionner un projet",
      required: false,
      options: projetOptions,
      isLoading: isLoadingProjets,
      gridCols: 1,
    },
  ],
});
