import type { FormConfig, SelectOption } from "../../Global/types/formConfig";
import { getActeurs } from "../allHooks/admin/acteurHooks";
import { getCadreStrategiques } from "../allHooks/admin/cadreStrategiqueHooks";
import { getLocalites } from "../allHooks/admin/localiteHooks";
import { getPersonnels } from "../allHooks/admin/personnelHooks";
import { getTypeActivites } from "../allHooks/admin/typeActivitesHooks";
import { getUgls } from "../allHooks/admin/uglHooks";

const chronogrammeOptions = [
    { label: "Jan", value: "Jan" },
    { label: "Fév", value: "Fév" },
    { label: "Mar", value: "Mar" },
    { label: "Avr", value: "Avr" },
    { label: "Mai", value: "Mai" },
    { label: "Jun", value: "Jun" },
    { label: "Jul", value: "Jul" },
    { label: "Aoû", value: "Aoû" },
    { label: "Sep", value: "Sep" },
    { label: "Oct", value: "Oct" },
    { label: "Nov", value: "Nov" },
    { label: "Déc", value: "Déc" },
]

const typeActivitesData = await getTypeActivites();

const localites = await getLocalites();

const acteurs = await getActeurs();

const personnels = await getPersonnels();

const cadre_strategiques = await getCadreStrategiques();

// const plan_Sites = await getPlanSites();

const ugls = await getUgls();

// Transformer les données en options pour le select
const typeActivitesOptions = typeActivitesData?.map((item: any) => (
    {
        label: item.intutile_type,
        value: String(item.code_type)
    })) || [];

const cadreStrategiqueOptions = cadre_strategiques.map((cadre) => ({
    value: cadre.id_cs,
    label: `${cadre.code_cs} - ${cadre.intutile_cs}`,
}));

const localiteOptions = localites
    .filter((localite) => {
        if (typeof localite.niveau_loca === 'object' && localite.niveau_loca !== null) {
            return localite.niveau_loca.nombre_nlc === 1;
        }
        return localite.niveau_loca === 1;
    })
    .map((localite) => ({
        value: localite.id_loca as number,
        label: localite.intitule_loca,
    }));
const acteurOptions = acteurs
    .filter((acteur) => acteur.id_acteur !== undefined)
    .map((acteur) => ({
        value: acteur.id_acteur as number,
        label: acteur.nom_acteur,
    }));

const personnelOptions = personnels.map((p) => ({
    value: p.n_personnel!,
    label: `${p.prenom_perso} ${p.nom_perso}`,
}));

const uglOptions = ugls.map((ugl) => ({
    value: ugl.code_ugl,
    label: ugl.nom_ugl,
}));
// const planSiteOptions = plan_Sites.map((planSite) => ({
//     value: planSite.code_ds,
//     label: planSite.intutile_ds,
// }));

export const getPtbaFormConfig = (
    cadreAnalytiqueOptions: SelectOption[] = []
): FormConfig => ({


    // Definition des etapes du formulaire
    steps: [
        {
            step: 1,
            title: "Identité",
        },
        {
            step: 2,
            title: "Coordonnées",
        }
    ],
    fields: [

        // texte - Code activité PTBA
        {
            name: "code_activite_ptba",
            label: "Code activité PTBA",
            type: "text",
            placeholder: "Ex: ACT001, PTBA01...",
            required: true,
            gridCols: 2,
            formStep: 1,
        },

        // select - Type activité
        {
            name: "type_activite",
            label: "Type activité",
            type: "select",
            placeholder: "Sélectionner un type d'activité",
            required: true,
            options: typeActivitesOptions, // À remplir dynamiquement depuis l'API
            gridCols: 2,
            formStep: 1,
        },
        // texte - Intitulé activité PTBA
        {
            name: "intitule_activite_ptba",
            label: "Intitulé activité PTBA",
            type: "textarea",
            placeholder: "Intitulé de l'activité (max 200 caractères)",
            required: true,
            maxLength: 200,
            gridCols: 1,
            formStep: 1,
        },
        // select - Cadre analytique (optionnel)
        {
            name: "cadre_analytique",
            label: "Cadre analytique",
            type: "select",
            placeholder: "Sélectionner un cadre analytique (optionnel)",
            required: true,
            options: cadreAnalytiqueOptions,
            gridCols: 1,
            formStep: 1,
        },

        // texte - Chronogramme
        {
            name: "chronogramme",
            label: "Chronogramme",
            type: "checkbox-group",
            multiple: true,
            required: true,
            options: chronogrammeOptions,
            gridCols: 1,
            formStep: 1,
        },

        // select multiple - Localités PTBA
        {
            name: "localites_ptba",
            label: "Localités",
            type: "multiselect",
            placeholder: "Sélectionner une ou plusieurs localités",
            required: true,
            options: localiteOptions, // À remplir dynamiquement depuis l'API
            gridCols: 2,
            formStep: 2,
        },

        // select - Code CRP (optionnel)
        {
            name: "code_crp",
            label: "Cadre strategique",
            type: "select",
            placeholder: "Sélectionner un cadre stratégique (optionnel)",
            required: false,
            options: cadreStrategiqueOptions, // À remplir dynamiquement depuis l'API
            gridCols: 2,
            formStep: 2,
        },

        // select multiple - Partenaires concernés
        {
            name: "partenaire_conserne_ptba",
            label: "Partenaires concernés",
            type: "multiselect",
            placeholder: "Sélectionner un ou plusieurs partenaires",
            required: true,
            options: acteurOptions, // À remplir dynamiquement depuis l'API
            gridCols: 1,
            formStep: 2,
        },
        // select - Responsable PTBA (optionnel)
        {
            name: "responsable_ptba",
            label: "Responsable PTBA",
            type: "select",
            placeholder: "Sélectionner un responsable (optionnel)",
            required: false,
            options: personnelOptions, // À remplir dynamiquement depuis l'API
            gridCols: 2,
            formStep: 2,
        },
        // select - Direction PTBA (optionnel)
        {
            name: "ugl_ptba",
            label: "Unité de gestion",
            type: "select",
            placeholder: "Sélectionner une unité de gestion (optionnel)",
            required: false,
            options: uglOptions, // À remplir dynamiquement depuis l'API
            gridCols: 2,
            formStep: 2,
        },
    ]

})