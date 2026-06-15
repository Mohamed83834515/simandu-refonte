import type { FormConfig } from "../../Global/types/formConfig";

export const getTypeActiviteFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code type
        {
            name: "code_type",
            label: "Code type",
            type: "text",
            placeholder: "Ex: TYP001, ACT01...",
            required: true,
            gridCols: 2,
        },
        // texte - Intitulé type
        {
            name: "intutile_type",
            label: "Intitulé type",
            type: "text",
            placeholder: "Ex: Formation, Atelier, Consultation...",
            required: true,
            gridCols: 2,
        },
        // textarea - Description
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Description détaillée du type d'activité...",
            rows: 4,
            required: false,
            gridCols: 1,
        },
    ]

})