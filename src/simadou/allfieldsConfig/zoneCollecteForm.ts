import type { FormConfig } from "../../Global/types/formConfig";

export const getZoneCollecteFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code zone
        {
            name: "code_zone",
            label: "Code zone",
            type: "text",
            placeholder: "Ex: ZC001, ZONE01...",
            required: true,
            gridCols: 2,
        },
        // texte - Nom zone
        {
            name: "nom_zone",
            label: "Nom zone",
            type: "text",
            placeholder: "Nom de la zone de collecte",
            required: true,
            gridCols: 2,
        },
        {
            name: "shape_file",
            label: "Shape file",
            type: "file",
            accept: 'application/pdf,image/*,.doc,.docx',
            maxSize: 10,
            helperText: "Formats acceptés: PDF, DOC, DOCX (max 10MB)",
            required: false,
            gridCols: 1,
        },
        // texte - Type zone
        {
            name: "type_zone",
            label: "Type zone",
            type: "select",
            placeholder: "Ex: Urbain, Rural, Périurbain...",
            options: [], // Les options seront chargées dynamiquement
            required: true,
            gridCols: 1,
        },
        {
            name: "latitude_zone",
            label: "Latitude zone",
            type: "number",
            placeholder: "Ex: 5.6789...",
            required: false,
            gridCols: 2,
        },
        {
            name: "longitude_zone",
            label: "Longitude zone",
            type: "number",
            placeholder: "Ex: 10.6789...",
            required: false,
            gridCols: 2,
        },
    ]

})