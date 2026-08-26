import type { FormConfig } from "../../Global/types/formConfig";

export const getLocaliteFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code localité
        {
            name: "code_loca",
            label: "Code localité",
            type: "text",
            placeholder: "Ex: LOC001, REG01...",
            required: true,
            gridCols: 2,
        },

        // texte - Code national localité
        {
            name: "code_national_loca",
            label: "Code national localité",
            type: "text",
            placeholder: "Ex: SN001, SN002...",
            required: true,
            gridCols: 2,
        },
        // texte - Intitulé localité
        {
            name: "intitule_loca",
            label: "Intitulé localité",
            type: "text",
            placeholder: "Ex: Kindia, Labé, Mamou...",
            required: true,
            gridCols: 2,
        },
        {
            name: "latitude_loca",
            label: "Latitude localité",
            type: "number",
            placeholder: "Ex: 5.6789...",
            required: false,
            gridCols: 2,
        },
        {
            name: "longitude_loca",
            label: "Longitude localité",
            type: "number",
            placeholder: "Ex: 10.6789...",
            required: false,
            gridCols: 2,
        },

    ]

})