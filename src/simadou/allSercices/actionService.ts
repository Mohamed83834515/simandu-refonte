import { apiClient } from "@/axios/api";
import { Action } from "../allTypes/action";

const BASE_URL = "/activites-programmes/";

export const actionService = {
  // Récupérer toutes les actions (filtrées par programme)
  async getAll(id_programme: number): Promise<Action[]> {
    const response = await apiClient.request<Action[]>(BASE_URL);
    return response.filter((action) => action.id_programme === id_programme);
  },

  // Créer une nouvelle action
  async create(data: Action): Promise<Action> {
    const { id_ap, ...form } = data;
    return await apiClient.request<Action>(BASE_URL, {
      method: "POST",
      data: form,
    });
  },

  // Mettre à jour une action
  async update(data: Action): Promise<Action> {
    const { id_ap, ...form } = data;
    return await apiClient.request<Action>(`${BASE_URL}${id_ap}/`, {
      method: "PUT",
      data: form,
    });
  },

  // Supprimer une action (Note: dans le fichier delete.ts d'origine, l'URL était différente)
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  },

  // Note: La fonction DeleteNiveauAction d'origine pointait vers niveau_activites_programme_config
  // Si c'est vraiment ce qui est voulu, on devrait peut-être le mettre dans niveauActionService
  async deleteNiveauAction(id: number): Promise<void> {
    await apiClient.request<void>(`/niveau_activites_programme_config/${id}/`, {
      method: "DELETE",
    });
  }
};
