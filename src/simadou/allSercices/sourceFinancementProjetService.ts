import { apiClient } from "@/axios/api";
import { SourFinancementProjet } from "../allTypes/sourceFinancemanetProjet";
import { SourceFinancementProjetFormData } from "../schemas/sourceFinancementProjet";

const ENDPOINT = "/sources-financement-projet/";

const sourceFinancementProjetService = {
    async getAll(): Promise<SourFinancementProjet[]> {
        return apiClient.request(ENDPOINT, { method: "GET" });
    },

    async getById(id: number): Promise<SourFinancementProjet> {
        return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
    },

    async getByActivite(niveauId: string): Promise<{ sourceFinancement: SourFinancementProjet[] }> {
        const allSource = await this.getAll()
        // Filtrer les localités dont l'objet niveau_loca a l'id correspondant
        const filtered = allSource.filter((src) => {
            // Si niveau_loca est un objet, comparer son id
            if (src.code_activite_projet && src.code_activite_projet !== null) {
                return src.code_activite_projet === niveauId
            }
            // Si c'est un nombre (ancienne structure), comparer directement
            return src.niveau_loca === niveauId
        })
        return { sourceFinancement: filtered }
    },

    async create(data: SourceFinancementProjetFormData): Promise<SourFinancementProjet> {
        return apiClient.request(ENDPOINT, {
            method: "POST",
            data,
        });
    },

    async update(
        id: number,
        data: Partial<SourceFinancementProjetFormData>,
    ): Promise<SourFinancementProjet> {
        return apiClient.request(`${ENDPOINT}${id}/`, {
            method: "PUT",
            data,
        });
    },

    async delete(id: number): Promise<void> {
        await apiClient.request(`${ENDPOINT}${id}/`, {
            method: "DELETE",
        });
    },
};

export default sourceFinancementProjetService;