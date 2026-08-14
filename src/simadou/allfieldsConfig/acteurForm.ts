import type { FormConfig } from "../../Global/types/formConfig";

export const getActeurFormConfig = (): FormConfig => ({

    fields: [
        // texte - Code acteur
        {
            name: "code_acteur",
            label: "Code acteur",
            type: "text",
            placeholder: "Ex: ACT001, ART01...",
            required: true,
            gridCols: 2,
        },
        // texte - Nom acteur
        {
            name: "nom_acteur",
            label: "Nom acteur",
            type: "text",
            placeholder: "Nom complet de l'acteur",
            required: true,
            gridCols: 2,
        },
        // textarea - Description acteur
        {
            name: "description_acteur",
            label: "Description",
            type: "textarea",
            placeholder: "Description détaillée de l'acteur...",
            required: false,
            gridCols: 1,
        },
        // texte - Personne responsable
        {
            name: "personne_responsable",
            label: "Personne responsable",
            type: "text",
            placeholder: "Nom du responsable",
            required: true,
            gridCols: 1,
        },
        // texte - Contact
        {
            name: "contact",
            label: "Contact",
            type: "text",
            placeholder: "Téléphone, WhatsApp...",
            required: true,
            gridCols: 2,
        },
        // email - Adresse email
        {
            name: "adresse_email",
            label: "Adresse email",
            type: "email",
            placeholder: "exemple@domaine.com",
            required: true,
            gridCols: 2,
        },
        // select - Catégorie acteur (relation)
        {
            name: "categorie_acteur",
            label: "Catégorie acteur",
            type: "select",
            placeholder: "Sélectionner une catégorie",
            required: true,
            options: [], 
            gridCols: 1,
        },
    ]

})