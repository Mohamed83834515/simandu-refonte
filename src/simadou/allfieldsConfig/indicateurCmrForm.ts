import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

const FONCTION_AGREGAT_OPTIONS: SelectOption[] = [
  { value: "Somme", label: "Somme" },
  { value: "Moyenne", label: "Moyenne" },
  { value: "Minimum", label: "Minimum" },
  { value: "Maximum", label: "Maximum" },
  { value: "Comptage", label: "Comptage" },
  { value: "Médiane", label: "Médiane" },
  { value: "Ratio", label: "Ratio" },
  { value: "Pourcentage", label: "Pourcentage" },
];

export const getIndicateurCmrFormConfigForDialog = ({
  referentielOptions,
  isLoadingReferentiels,
  indicateurStrategiqueOptions,
  isLoadingIndicateursStrategiques,
}: {
  referentielOptions: SelectOption[];
  isLoadingReferentiels?: boolean;
  indicateurStrategiqueOptions?: SelectOption[];
  isLoadingIndicateursStrategiques?: boolean;
}): FormConfig => ({
  fields: [
    {
      name: "code_ref_ind",
      label: "Code de référence",
      type: "text",
      placeholder: "ex: CMR001, REF001",
      required: true,
      maxLength: 50,
      gridCols: 2,
    },
    {
      name: "annee_reference",
      label: "Année de référence",
      type: "number",
      placeholder: "ex: 2024",
      required: true,
      min: 2000,
      max: 2050,
      step: 1,
      gridCols: 2,
    },
    {
      name: "intitule_ref_ind",
      label: "Intitulé de l'indicateur",
      type: "textarea",
      placeholder: "Intitulé complet de l'indicateur de référence",
      required: true,
      maxLength: 200,
      gridCols: 1,
    },
    {
      name: "resultat_cmr",
      label: "Résultat CMR",
      type: indicateurStrategiqueOptions ? "select" : "text",
      placeholder: indicateurStrategiqueOptions
        ? "Sélectionner un indicateur stratégique…"
        : "Résultat attendu du cadre de mesure de résultats",
      required: true,
      maxLength: indicateurStrategiqueOptions ? undefined : 200,
      options: indicateurStrategiqueOptions ?? [],
      isLoading: isLoadingIndicateursStrategiques,
      gridCols: 2,
    },
    {
      name: "reference_cmr",
      label: "Référence CMR",
      type: "text",
      placeholder: "Référence du cadre de mesure de résultats",
      required: true,
      maxLength: 200,
      gridCols: 2,
    },
    {
      name: "referentiel_cmr",
      label: "Référentiel",
      type: "select",
      placeholder: "Sélectionner un indicateur du dictionnaire…",
      required: false,
      options: referentielOptions,
      isLoading: isLoadingReferentiels,
      gridCols: 2,
    },
    {
      name: "cible_cmr",
      label: "Cible CMR",
      type: "text",
      placeholder: "Valeur cible à atteindre",
      required: true,
      maxLength: 50,
      gridCols: 2,
    },
    {
      name: "fonction_agregat_cmr",
      label: "Fonction d'agrégation",
      type: "select",
      placeholder: "Sélectionner une fonction",
      required: true,
      options: FONCTION_AGREGAT_OPTIONS,
      gridCols: 2,
    },
    {
      name: "responsable_collecte_cmr",
      label: "Responsable de collecte",
      type: "text",
      placeholder: "Responsable de la collecte des données",
      required: true,
      maxLength: 100,
      gridCols: 2
    },
  ],
});
