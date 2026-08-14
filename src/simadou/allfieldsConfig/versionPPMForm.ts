import type { FormConfig } from "../../Global/types/formConfig";

export const getVersionPPMFormConfig = (): FormConfig => ({

    fields: [
        // texte - Numéro version PPM
        {
            name: "numero_version_ppm",
            label: "Numéro version PPM",
            type: "text",
            placeholder: "Ex: 1.0, 2.0, 3.0...",
            required: true,
            gridCols: 1,
        },
        // textarea - Date version PPM
        {
            name: "date_version",
            label: "Date version PPM",
            type: "date",
            required: true,
            gridCols: 1,
        },
    ]

})