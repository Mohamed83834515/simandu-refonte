import { apiClient } from "@/axios/api";
import { Activite } from "../allTypes/activite";

export const activiteService = {
  // Récupérer toutes les activités (filtrées par projet)
  // Note: l'API d'origine utilisait activite_programme/ pour le GET
  async getAll(id_projet: number): Promise<Activite[]> {
    const response = await apiClient.request<Activite[]>("/activites-programmes/");
    return response.filter((activite) => activite.id_activite_projet === id_projet);
  },

  // Créer une nouvelle activité
  async create(data: Activite): Promise<Activite> {
    const { ...form } = data;
    return await apiClient.request<Activite>("/activites-programmes/", {
      method: "POST",
      data: form,
    });
  },

  // Mettre à jour une activité
  async update(data: Activite): Promise<Activite> {
    const { id_activite_projet, ...form } = data;
    return await apiClient.request<Activite>(`/activites-programmes/${id_activite_projet}/`, {
      method: "PUT",
      data: form,
    });
  },

  // Supprimer une activité
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`/niveau_activite_config/${id}/`, {
      method: "DELETE",
    });
  }
};
