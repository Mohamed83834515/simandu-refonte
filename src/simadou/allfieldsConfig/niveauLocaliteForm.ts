import type { FormConfig } from "../../Global/types/formConfig";

export const getNiveauLocaliteFormConfig = (): FormConfig => ({

    fields: [
        // number - Nombre niveau localité
        {
            name: "nombre_nlc",
            label: "Nombre niveau localité",
            type: "number",
            placeholder: "Ex: 1, 2, 3...",
            required: true,
            min: 1,
            gridCols: 2,
        },
        // texte - Libellé niveau localité
        {
            name: "libelle_nlc",
            label: "Libellé niveau localité",
            type: "text",
            placeholder: "Ex: Région, Département, Commune...",
            required: true,
            gridCols: 2,
        },
        // number - Code number niveau localité
        {
            name: "Code_number_nlc",
            label: "Code number niveau localité",
            type: "number",
            placeholder: "Ex: 01, 02, 03...",
            required: true,
            min: 0,
            gridCols: 2,
        },
    ]

})