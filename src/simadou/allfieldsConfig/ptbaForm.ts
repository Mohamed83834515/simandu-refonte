// ptbaFormConfig.ts
import type { FormConfig, SelectOption } from "../../Global/types/formConfig";

const chronogrammeOptions = [
  { label: "Jan", value: "Jan" },
  { label: "Fév", value: "Fév" },
  { label: "Mar", value: "Mar" },
  { label: "Avr", value: "Avr" },
  { label: "Mai", value: "Mai" },
  { label: "Jun", value: "Jun" },
  { label: "Jul", value: "Jul" },
  { label: "Aoû", value: "Aoû" },
  { label: "Sep", value: "Sep" },
  { label: "Oct", value: "Oct" },
  { label: "Nov", value: "Nov" },
  { label: "Déc", value: "Déc" },
];

export const getPtbaFormConfig = (
  cadreAnalytiqueOptions: SelectOption[] = [],
  typeActivitesOptions: SelectOption[] = [],
  localiteOptions: SelectOption[] = [],
  planSiteOptions: SelectOption[] = [],
  personnelOptions: SelectOption[] = [],
  uglOptions: SelectOption[] = [],
  cadreStrategiqueOptions: SelectOption[] = [],
  labels: {
    cadreAnalytique?: string
    cadreStrategique?: string
  } = {}
): FormConfig => ({
  steps: [
    { step: 1, title: "Identité" },
    { step: 2, title: "Partenaire" }
  ],
  fields: [
    {
      name: "intitule_activite_ptba",
      label: "Intitulé activité PAO",
      type: "textarea",
      placeholder: "Intitulé de l'activité (max 200 caractères)",
      required: true,
      maxLength: 200,
      gridCols: 1,
      formStep: 1,
    },
    {
      name: "cadre_analytique",
      label: labels.cadreAnalytique || "Cadre analytique",
      type: "select",
      placeholder: `Sélectionner ${labels.cadreAnalytique || 'un cadre analytique'}`,
      required: true,
      options: cadreAnalytiqueOptions || [],
      gridCols: 2,
      formStep: 1,
    },
    {
      name: "code_activite_ptba",
      label: "Code activité PAO",
      type: "text",
      placeholder: "Ex: ACT001, PTBA01...",
      required: true,
      gridCols: 2,
      formStep: 1,
    },
    {
      name: "chronogramme",
      label: "Chronogramme",
      type: "checkbox-group",
      multiple: true,
      required: true,
      options: chronogrammeOptions,
      gridCols: 1,
      formStep: 1,
    },
    {
      name: "code_crp",
      label: labels.cadreStrategique || "Cadre stratégique",
      type: "select",
      placeholder: `Sélectionner ${labels.cadreStrategique || 'un cadre stratégique'}`,
      required: false,
      options: cadreStrategiqueOptions || [],
      gridCols: 2,
      formStep: 2,
    },
    {
      name: "ugl_ptba",
      label: "Unité de gestion",
      type: "select",
      placeholder: "Sélectionner une unité de gestion",
      required: false,
      options: uglOptions || [],
      gridCols: 2,
      formStep: 2,
    },
    {
      name: "partenaire_conserne_ptba",
      label: "Direction/Service",
      type: "multiselect",
      placeholder: "Sélectionner une ou plusieurs directions/services",
      required: true,
      options: planSiteOptions || [],
      gridCols: 2,
      formStep: 2,
    },
    {
      name: "responsable_ptba",
      label: "Responsable PAO",
      type: "select",
      placeholder: "Sélectionner un responsable",
      required: false,
      options: personnelOptions || [],
      gridCols: 2,
      formStep: 2,
    },
    {
      name: "type_activite",
      label: "Type activité",
      type: "select",
      placeholder: "Sélectionner un type d'activité",
      required: true,
      options: typeActivitesOptions || [],
      gridCols: 2,
      formStep: 2,
    },
    {
      name: "localites_ptba",
      label: "Direction régionale",
      type: "multiselect",
      placeholder: "Sélectionner une ou plusieurs directions régionales",
      required: true,
      options: localiteOptions || [],
      gridCols: 2,
      formStep: 2,
    },
  ]
});
