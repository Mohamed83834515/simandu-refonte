import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { NiveauCadreAnalytique } from "../allTypes";

export interface NiveauCadreAnalytiqueFormData {
  nombre_nca: number;
  libelle_nca: string;
  code_number_nca: number;
  programme?: string;
}

const BASE_URL = "/niveaux-cadre-analytique/"
export const niveauCadreAnalytiqueService = {
  // Récupérer tous les niveaux

  async getAll(): Promise<NiveauCadreAnalytique[]> {
    try {
      return await apiClient.request<NiveauCadreAnalytique[]>(
        BASE_URL,
      );
    } catch (error) {
      toast.error("Erreur lors de la récupération des niveaux");
      throw error;
    }
  },

  // Récupérer un niveau par ID
  async getById(id_nca: number): Promise<NiveauCadreAnalytique> {
    try {
      const response = await apiClient.request<NiveauCadreAnalytique>(
        `${BASE_URL}${id_nca}/`,
      );
      return response;
    } catch (error) {
      toast.error("Erreur lors de la récupération du niveau");
      throw error;
    }
  },

  // Créer un nouveau niveau
  async create(
    data: NiveauCadreAnalytiqueFormData,
  ): Promise<NiveauCadreAnalytique> {
    return await apiClient.request<NiveauCadreAnalytique>(
     BASE_URL,
      {
        method: "POST",
        data,
      },
    );
  },

  // Mettre à jour un niveau
  async update(
    id_nca: number,
    data: NiveauCadreAnalytiqueFormData,
  ): Promise<NiveauCadreAnalytique> {
    return await apiClient.request<NiveauCadreAnalytique>(
      `${BASE_URL}${id_nca}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  // Supprimer un niveau
  async delete(id_nca: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id_nca}/`, {
      method: "DELETE",
    });
  },

  // Rechercher des niveaux
  async search(query: string): Promise<NiveauCadreAnalytique[]> {
    try {
      const response = await apiClient.request<NiveauCadreAnalytique[]>(
        `${BASE_URL}search/?q=${encodeURIComponent(query)}`,
      );
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la recherche de niveaux");
      throw error;
    }
  },

  // Récupérer les niveaux par type
  async getByType(type_niveau: 1 | 2 | 3): Promise<NiveauCadreAnalytique[]> {
    try {
      const response = await apiClient.request<NiveauCadreAnalytique[]>(
        `${BASE_URL}?type_niveau=${type_niveau}`,
      );
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des niveaux par type");
      throw error;
    }
  },
};
