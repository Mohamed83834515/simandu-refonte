import type { FormConfig } from "../../Global/types/formConfig";

export const getUniteIndicateurFormConfig = (): FormConfig => ({

    fields: [
        // texte - Unité
        {
            name: "unite_ui",
            label: "Unité",
            type: "text",
            placeholder: "Ex: Kg, %, Nbre, GNF...",
            required: true,
            gridCols: 1,
        },
        // textarea - Définition
        {
            name: "definition_ui",
            label: "Définition",
            type: "textarea",
            placeholder: "Définition de l'unité de mesure...",
            rows: 3,
            required: true,
            gridCols: 1,
        },
    ]

})