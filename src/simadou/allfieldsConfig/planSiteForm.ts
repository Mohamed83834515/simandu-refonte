import type { FormConfig } from "../../Global/types/formConfig";

export const getPlanSiteFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code plan site
        {
            name: "code_ds",
            label: "Code plan site",
            type: "text",
            placeholder: "Ex: DS001, SITE01...",
            required: true,
            gridCols: 2,
        },
        // texte - Intitulé plan site
        {
            name: "intutile_ds",
            label: "Intitulé plan site",
            type: "text",
            placeholder: "Intitulé du plan site",
            required: true,
            gridCols: 2,
        },

        // texte - Code relai plan site
        {
            name: "code_relai_ds",
            label: "Code relai plan site",
            type: "text",
            placeholder: "Code du relai",
            required: true,
            gridCols: 2,
        },

    ]

})