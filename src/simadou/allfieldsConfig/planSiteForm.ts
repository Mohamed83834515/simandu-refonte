import type { FormConfig } from "../../Global/types/formConfig";

export const getPlanSiteFormConfig = (niveauLabel = 'structure'): FormConfig => ({
    fields: [
        {
            name: "code_ds",
            label: `C ${niveauLabel}`,
            type: "text",
            placeholder: `Ex: code ${niveauLabel}...`,
            required: true,
            gridCols: 2,
        },
        {
            name: "intutile_ds",
            label: `Intitulé ${niveauLabel}`,
            type: "text",
            placeholder: `Intitulé ${niveauLabel}`,
            required: true,
            gridCols: 2,
        },
        {
            name: "code_relai_ds",
            label: `Numéro ${niveauLabel}`,
            type: "text",
            placeholder: `Numéro ${niveauLabel}`,
            required: true,
            gridCols: 2,
        },
    ]
})
