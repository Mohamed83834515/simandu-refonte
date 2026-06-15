import { apiClient } from "@/axios/api";
import { CadreAnalytique } from "../allTypes/cadreAnalytique";

const BASE_URL = "/cadres-analytiques/";

export const cadreAnalytiqueService = {
  // Récupérer tous les cadres analytiques (optionnellement filtrés par programme)
  async getAll(programmeId?: number): Promise<CadreAnalytique[]> {
    let url = BASE_URL;
    if (programmeId) {
      url += `?programme_ca=${programmeId}`;
    }
    return await apiClient.request<CadreAnalytique[]>(url);
  },

  // Créer un nouveau cadre analytique
  async create(data: CadreAnalytique): Promise<CadreAnalytique> {
    return await apiClient.request<CadreAnalytique>(BASE_URL, {
      method: "POST",
      data,
    });
  },

  // Mettre à jour un cadre analytique
  async update(data: CadreAnalytique): Promise<CadreAnalytique> {
    const { id_ca, ...form } = data;
    return await apiClient.request<CadreAnalytique>(`${BASE_URL}${id_ca}/`, {
      method: "PUT",
      data: form,
    });
  },

  // Supprimer un cadre analytique
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  }
};
