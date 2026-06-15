import type { FormConfig } from "../../Global/types/formConfig";

export const getFonctionFormConfig = (): FormConfig => ({

    fields: [
        // texte - Nom fonction
        {
            name: "nom_fonction",
            label: "Nom fonction",
            type: "text",
            placeholder: "Ex: Chef de projet, Coordinateur, Assistant...",
            required: true,
            gridCols: 1,
        },
        // textarea - Description fonction
        {
            name: "description_fonction",
            label: "Description fonction",
            type: "textarea",
            placeholder: "Description détaillée de la fonction...",
            rows: 4,
            required: true,
            gridCols: 1,
        },
    ]

})