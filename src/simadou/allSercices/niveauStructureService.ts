import { apiClient } from "@/axios/api";
import { NiveauStructure } from "../allTypes/niveauStructure";

const BASE_URL = "/niveaux-structure-config/";

export const niveauStructureService = {
  // Récupérer tous les niveaux de structures
  async getAll(): Promise<NiveauStructure[]> {
    return await apiClient.request<NiveauStructure[]>(BASE_URL);
  },

  // Récupérer un niveau par ID
  async getById(id: number): Promise<NiveauStructure> {
    return await apiClient.request<NiveauStructure>(`${BASE_URL}${id}/`);
  },

  // Créer un nouveau niveau
  async create(data: NiveauStructure): Promise<NiveauStructure> {
    return await apiClient.request<NiveauStructure>(BASE_URL, {
      method: "POST",
      data,
    });
  },

  // Mettre à jour un niveau
  async update(data: NiveauStructure): Promise<NiveauStructure> {
    return await apiClient.request<NiveauStructure>(`${BASE_URL}${data.id_nsc}/`, {
      method: "PUT",
      data,
    });
  },

  // Supprimer un niveau
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  }
};
