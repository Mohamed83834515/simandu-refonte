import { apiClient } from "@/axios/api";
import { } from "../allTypes";
import { AvancementDirection } from "../allTypes/dashboardType";
import { NiveauCadreAnalytiqueComposante } from "../allTypes/composanteGraphe";


export const dashboardService = {
    // Get all acteurs
    avancementParDirections: async (codeProgramme: string): Promise<AvancementDirection[]> => {
        const response = await apiClient.request<AvancementDirection[]>(
            `ptbas/taux-execution-ugls/?code_programme=${codeProgramme}`);
        return Array.isArray(response) ? response : [];
    },

    avancementParComposante: async (codeProgramme: string, niveau: number, annee: number): Promise<NiveauCadreAnalytiqueComposante[]> => {
        const response = await apiClient.request<NiveauCadreAnalytiqueComposante[]>(
            `cadres-analytiques/stats/avancements-composantes/?code_programme=${codeProgramme}&nombre_nca=${niveau}&version_ptba=${annee}`);
        return response ;
    },

};
