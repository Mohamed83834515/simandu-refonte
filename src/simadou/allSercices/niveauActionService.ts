import { apiClient } from "@/axios/api";
import { NiveauAction } from "../allTypes/niveauAction";

const BASE_URL = "/niveau_activites_programme_config/";

export const niveauActionService = {
  // Récupérer tous les niveaux d'actions (filtrés par programme)
  async getAll(code_programme: number): Promise<NiveauAction[]> {
    const response = await apiClient.request<NiveauAction[]>(BASE_URL);
    return response.filter((niveau) => niveau.code_programme === code_programme);
  },

  // Créer plusieurs niveaux d'actions
  async createMany(data: NiveauAction[]): Promise<any[]> {
    const promises = data.map((item) => {
      const { ...form } = item;
      return apiClient.request(BASE_URL, {
        method: "POST",
        data: form,
      });
    });
    return await Promise.all(promises);
  },

  // Mettre à jour un niveau d'action
  async update(id: number, data: Partial<NiveauAction>): Promise<NiveauAction> {
    return await apiClient.request<NiveauAction>(`${BASE_URL}${id}/`, {
      method: "PUT",
      data,
    });
  },

  // Supprimer un niveau d'action (Note: l'URL dans delete.ts était activite_programme/)
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`/activites-programmes/${id}/`, {
      method: "DELETE",
    });
  }
};
