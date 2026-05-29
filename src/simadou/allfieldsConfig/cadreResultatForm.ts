import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

export const getCadreResultatFormConfigForDialog = ({
  niveauOptions,
  parentOptions,
  acteurOptions,
  projetOptions,
  isLoadingActeurs,
  isLoadingProjets,
  showParent,
  showProjet = true,
}: {
  niveauOptions: SelectOption[];
  parentOptions: SelectOption[];
  acteurOptions: SelectOption[];
  projetOptions: SelectOption[];
  isLoadingActeurs?: boolean;
  isLoadingProjets?: boolean;
  showParent: boolean;
  showProjet?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "code_cr",
      label: "Code du cadre",
      type: "text",
      placeholder: "ex: CR001, RES001",
      required: true,
      maxLength: 50,
      gridCols: 2,
    },
    {
      name: "cout_axe",
      label: "Coût de l'axe",
      type: "number",
      placeholder: "Entrez le coût",
      required: true,
      min: 0,
      step: 1,
      gridCols: 2,
    },
    {
      name: "intutile_cr",
      label: "Intitulé du cadre",
      type: "text",
      placeholder: "Intitulé complet du cadre de résultat",
      required: true,
      maxLength: 200,
      gridCols: 1,
    },
    {
      name: "abgrege_cr",
      label: "Abrégé",
      type: "text",
      placeholder: "Abrégé du cadre",
      required: true,
      maxLength: 50,
      gridCols: 2,
    },
    {
      name: "niveau_cr",
      label: "Niveau",
      type: "select",
      placeholder: "Sélectionnez un niveau",
      required: false,
      options: niveauOptions,
      gridCols: 2,
    },
    ...(showParent
      ? [
          {
            name: "parent_cr",
            label: "Cadre parent",
            type: "select" as const,
            placeholder: "Sélectionnez un cadre parent",
            required: false,
            options: parentOptions,
            gridCols: 2 as const,
          },
        ]
      : []),
    {
      name: "partenaire_cr",
      label: "Partenaire",
      type: "select",
      placeholder: "Sélectionnez un partenaire",
      required: false,
      options: acteurOptions,
      isLoading: isLoadingActeurs,
      gridCols: 2,
    },
    ...(showProjet
      ? [
          {
            name: "projet_cr",
            label: "Projet",
            type: "select" as const,
            placeholder: "Sélectionnez un projet",
            required: false,
            options: projetOptions,
            isLoading: isLoadingProjets,
            gridCols: 2 as const,
          },
        ]
      : []),
  ],
});
