import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

export function buildAnneeCibleOptionValue(year: number): string {
  return `${year}-01-01`;
}

export function buildAnneeCibleOptions(): SelectOption[] {
  const currentYear = new Date().getFullYear();
  const options: SelectOption[] = [];

  for (let i = 10; i >= 0; i--) {
    const year = currentYear - i;
    options.push({
      value: buildAnneeCibleOptionValue(year),
      label: String(year),
    });
  }

  for (let i = 1; i <= 10; i++) {
    const year = currentYear + i;
    options.push({
      value: buildAnneeCibleOptionValue(year),
      label: String(year),
    });
  }

  return options;
}

export const getCibleCmrProjetFormConfigForDialog = ({
  anneeOptions,
  indicateurOptions,
  uglOptions,
  isLoadingIndicateurs,
  isLoadingUgls,
}: {
  anneeOptions: SelectOption[];
  indicateurOptions: SelectOption[];
  uglOptions: SelectOption[];
  isLoadingIndicateurs?: boolean;
  isLoadingUgls?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "annee",
      label: "Année de la cible",
      type: "select",
      placeholder: "Sélectionnez l'année",
      required: true,
      options: anneeOptions,
      gridCols: 2,
    },
    {
      name: "valeur_cible_indcateur_crp",
      label: "Valeur cible de l'indicateur CRP",
      type: "number",
      placeholder: "Entrez la valeur cible",
      required: true,
      min: 0,
      step: 1,
      gridCols: 2,
    },
    {
      name: "code_indicateur_crp",
      label: "Indicateur de résultat du projet",
      type: "select",
      placeholder: "Sélectionnez un indicateur (optionnel)",
      required: false,
      options: indicateurOptions,
      isLoading: isLoadingIndicateurs,
      gridCols: 1,
    },
    {
      name: "code_ug",
      label: "UGL (Unité de Gestion Locale)",
      type: "select",
      placeholder: "Sélectionnez une UGL (optionnel)",
      required: false,
      options: uglOptions,
      isLoading: isLoadingUgls,
      gridCols: 1,
    },
  ],
});
