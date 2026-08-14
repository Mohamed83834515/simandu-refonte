import type { FormConfig } from "../../Global/types/formConfig";

export const getTypeProjetFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code type  projet
        {
            name: "code_type_projet",
            label: "Code type  projet",
            type: "text",
            placeholder: "Ex: TZ001, REG, DEP...",
            required: true,
            gridCols: 1,
        },
        // texte - Nom type  projet
        {
            name: "nom_type_projet",
            label: "Nom type  projet",
            type: "text",
            placeholder: "Ex: Mps, Agriculture...",
            required: true,
            gridCols: 1,
        },
    ]

})