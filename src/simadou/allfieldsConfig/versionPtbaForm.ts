import type { FormConfig } from "../../Global/types/formConfig";

export const getVersionPtbaFormConfig = (): FormConfig => ({

    fields: [
        // number - Année PTBA
        {
            name: "annee_ptba",
            label: "Année PTBA",
            type: "number",
            placeholder: "Ex: 2024",
            required: true,
            min: 2000,
            max: 2100,
            gridCols: 2,
        },
        // texte - Version PTBA (optionnel)
        {
            name: "version_ptba",
            label: "Version PTBA",
            type: "text",
            placeholder: "Ex: v1.0, v2.0, bêta...",
            required: false,
            maxLength: 30,
            gridCols: 2,
        },
        // date - Date validation
        {
            name: "date_validation",
            label: "Date validation",
            type: "date",
            placeholder: "AAAA-MM-JJ",
            required: true,
            gridCols: 2,
        },

        // select - Statut version (optionnel)
        // {
        //     name: "statut_version",
        //     label: "Statut version",
        //     type: "select",
        //     placeholder: "Sélectionner un statut",
        //     required: false,
        //     options: [
        //         { value: 0, label: "En Cours" },
        //         { value: 1, label: "Validée" },
        //         { value: 2, label: "Archivée" }
        //     ],
        //     gridCols: 2,
        // },

        // file - Document (optionnel)
        {
            name: "documentUrl",
            label: "Document",
            type: "file",
            accept: 'application/pdf,image/*,.doc,.docx',
            maxSize: 10,
            helperText: "Formats acceptés: PDF, DOC, DOCX (max 10MB)",
            required: false,
            gridCols: 2,
        },
        // textarea - Observation (optionnel)
        {
            name: "observation",
            label: "Observation",
            type: "textarea",
            placeholder: "Observations éventuelles...",
            rows: 2,
            required: false,
            gridCols: 1,
        },
    ]

})