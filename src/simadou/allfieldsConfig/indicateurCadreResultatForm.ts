import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

const PERIODICITE_OPTIONS: SelectOption[] = [
  { value: "Mensuel", label: "Mensuel" },
  { value: "Trimestriel", label: "Trimestriel" },
  { value: "Semestriel", label: "Semestriel" },
  { value: "Annuel", label: "Annuel" },
  { value: "Ponctuel", label: "Ponctuel" },
];

export const getIndicateurCadreResultatFormConfigForDialog = ({
  cadreOptions,
  acteurOptions,
  projetOptions,
  isLoadingCadres,
  isLoadingActeurs,
  isLoadingProjets,
  showProjet = false,
}: {
  cadreOptions: SelectOption[];
  acteurOptions: SelectOption[];
  projetOptions?: SelectOption[];
  isLoadingCadres?: boolean;
  isLoadingActeurs?: boolean;
  isLoadingProjets?: boolean;
  showProjet?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "code_indicateur_cr_iop",
      label: "Code indicateur CR",
      type: "text",
      placeholder: "ex: IND001, IOP001",
      required: true,
      maxLength: 50,
      gridCols: 2,
    },
    {
      name: "code_cr_iop",
      label: "Cadre de résultat",
      type: "select",
      placeholder: "Sélectionnez un cadre de résultat",
      required: true,
      options: cadreOptions,
      isLoading: isLoadingCadres,
      gridCols: 2,
    },
    {
      name: "intitule_indicateur_cr_iop",
      label: "Intitulé de l'indicateur CR",
      type: "text",
      placeholder: "Intitulé complet de l'indicateur",
      required: true,
      maxLength: 200,
      gridCols: 1,
    },
    {
      name: "niveau_iop",
      label: "Niveau",
      type: "number",
      placeholder: "Sélectionnez un niveau",
      required: true,
      min: 1,
      gridCols: 2,
    },
    {
      name: "periodicite_iop",
      label: "Périodicité",
      type: "select",
      placeholder: "Sélectionner une périodicité…",
      required: true,
      options: PERIODICITE_OPTIONS,
      gridCols: 2,
    },
    {
      name: "source_iop",
      label: "Source",
      type: "text",
      placeholder: "Source ou système de données",
      required: true,
      maxLength: 200,
      gridCols: 2,
    },
    {
      name: "responsable_iop",
      label: "Responsable",
      type: "text",
      placeholder: "Responsable de l'indicateur",
      required: true,
      maxLength: 200,
      gridCols: 2,
    },
    {
      name: "structure_iop",
      label: "Structure (Acteur)",
      type: "select",
      placeholder: "Sélectionnez un acteur",
      required: false,
      options: acteurOptions,
      isLoading: isLoadingActeurs,
      gridCols: 2,
    },
    ...(showProjet
      ? [
          {
            name: "projet_iop",
            label: "Projet",
            type: "select" as const,
            placeholder: "Sélectionnez un projet",
            required: false,
            options: projetOptions ?? [],
            isLoading: isLoadingProjets,
            gridCols: 2 as const,
          },
        ]
      : []),
    {
      name: "description_iop",
      label: "Description",
      type: "textarea",
      placeholder: "Description détaillée de l'indicateur…",
      rows: 4,
      required: true,
      maxLength: 1000,
      gridCols: 1,
    },
  ],
});
