import type { FormConfig } from "../../Global/types/formConfig";

export const getUGLFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code UGL
        {
            name: "code_ugl",
            label: "Code",
            type: "text",
            placeholder: "Ex: UGL001, UGL01...",
            required: true,
            gridCols: 2,
        },
        // texte - Abrégé UGL
        {
            name: "abrege_ugl",
            label: "Abrégé",
            type: "text",
            placeholder: "Ex: UGL, UGL-NORD...",
            required: true,
            gridCols: 2,
        },
        // texte - Nom UGL
        {
            name: "nom_ugl",
            label: "Nom",
            type: "textarea",
            placeholder: "Nom complet de l'UGL",
            required: true,
            gridCols: 1,
        },
        // color - Couleur UGL
        {
            name: "couleur_ugl",
            label: "Couleur",
            type: "color",
            placeholder: "#000000",
            required: true,
            gridCols: 1,
        },
        // select - Chef lieu UGL
        {
            name: "chef_lieu_ugl",
            label: "Chef du lieu",
            type: "select",
            placeholder: "Sélectionner une localité",
            required: true,
            options: [], // À remplir dynamiquement depuis l'API
            gridCols: 2,
        },
        // select multiple - Régions concernées
        {
            name: "region_concerne_ugl",
            label: "Régions concernées",
            type: "multiselect",
            placeholder: "Sélectionner une ou plusieurs régions",
            required: true,
            options: [], // À remplir dynamiquement depuis l'API
            gridCols: 2,
        },
    ]

})