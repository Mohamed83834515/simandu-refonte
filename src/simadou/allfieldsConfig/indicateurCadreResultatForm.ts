import type { FormConfig, SelectOption } from "../../Global/types/formConfig";
import { PERIODICITE_OPTIONS } from "./periodiciteOptions";

export const getIndicateurCadreResultatFormConfigForDialog = ({
  cadreOptions,
  acteurOptions,
  personnelOptions,
  isLoadingCadres,
  isLoadingActeurs,
  isLoadingPersonnels,
  hideCadreField = false,
  hideNiveauField = false,
  niveauOptions = [],
  isLoadingNiveaux = false,
}: {
  cadreOptions: SelectOption[];
  acteurOptions: SelectOption[];
  personnelOptions: SelectOption[];
  isLoadingCadres?: boolean;
  isLoadingActeurs?: boolean;
  isLoadingPersonnels?: boolean;
  hideCadreField?: boolean;
  hideNiveauField?: boolean;
  niveauOptions?: SelectOption[];
  isLoadingNiveaux?: boolean;
}): FormConfig => ({
  fields: [
    ...(hideCadreField
      ? [
          {
            name: "code_cr_iop",
            label: "Cadre de résultat",
            type: "hidden" as const,
          },
        ]
      : [
          {
            name: "code_cr_iop",
            label: "Cadre de résultat",
            type: "select" as const,
            placeholder: "Sélectionnez un cadre de résultat",
            required: true,
            options: cadreOptions,
            isLoading: isLoadingCadres,
            gridCols: 2 as const,
          },
        ]),
    ...(hideNiveauField
      ? [
          {
            name: "niveau_iop",
            label: "Niveau",
            type: "hidden" as const,
          },
        ]
      : [
          {
            name: "niveau_iop",
            label: "Niveau",
            type: "select" as const,
            placeholder: "Sélectionnez un niveau",
            required: true,
            options: niveauOptions,
            isLoading: isLoadingNiveaux,
            gridCols: 2 as const,
          },
        ]),
    {
      name: "projet_iop",
      label: "Projet",
      type: "hidden" as const,
    },
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
      name: "intitule_indicateur_cr_iop",
      label: "Intitulé de l'indicateur CR",
      type: "text",
      placeholder: "Intitulé complet de l'indicateur",
      required: true,
      maxLength: 200,
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
      type: "select",
      placeholder: "Sélectionner un responsable",
      required: true,
      options: personnelOptions,
      isLoading: isLoadingPersonnels,
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
