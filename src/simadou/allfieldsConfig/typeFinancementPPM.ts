import type { FormConfig } from "../../Global/types/formConfig";

export const getTypeFinancementPPMFormConfig = (): FormConfig => ({

    fields: [
        // texte - Numéro version PPM
        {
            name: "code_type_financement_ppm",
            label: "Code type financement PPM",
            type: "text",
            placeholder: "Ex: 1.0, 2.0, 3.0...",
            required: true,
            gridCols: 1,
        },
        // textarea - Date version PPM
        {
            name: "intitule_type_financement_ppm",
            label: "Intitulé type de Financement PPM",
            type: "textarea",
            required: true,
            gridCols: 1,
        },
    ]

})