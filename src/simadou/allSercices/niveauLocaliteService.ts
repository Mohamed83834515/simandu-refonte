import { apiClient } from "@/axios/api";
import { NiveauLocalite } from "../allTypes/niveauLocalite";

const BASE_URL = "/niveaux-localite-config/";

export const niveauLocaliteService = {
  // Récupérer tous les niveaux de localités
  async getAll(): Promise<NiveauLocalite[]> {
    return await apiClient.request<NiveauLocalite[]>(BASE_URL)
  },

  // Récupérer un niveau par ID
  async getById(id: number): Promise<NiveauLocalite> {
    return await apiClient.request<NiveauLocalite>(`${BASE_URL}${id}/`)
  },

  // Créer des nouveaux niveaux (accepte un tableau)
  async create(data: NiveauLocalite[]): Promise<any> {
    return await apiClient.request(BASE_URL, {
      method: "POST",
      data,
    })
  },

  // Mettre à jour un niveau
  async update(data: NiveauLocalite): Promise<any> {
    return await apiClient.request(`${BASE_URL}${data.id_nlc}/`, {
      method: "PUT",
      data,
    })
  },

  // Supprimer un niveau
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    })
  },
}
