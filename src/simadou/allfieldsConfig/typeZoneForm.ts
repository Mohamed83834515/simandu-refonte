import type { FormConfig } from "../../Global/types/formConfig";

export const getTypeZoneFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code type zone
        {
            name: "code_type_zone",
            label: "Code type zone",
            type: "text",
            placeholder: "Ex: TZ001, REG, DEP...",
            required: true,
            gridCols: 1,
        },
        // texte - Nom type zone
        {
            name: "nom_type_zone",
            label: "Nom type zone",
            type: "text",
            placeholder: "Ex: Région, Département, Commune...",
            required: true,
            gridCols: 1,
        },
    ]

})