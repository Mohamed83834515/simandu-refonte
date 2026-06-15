import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { NiveauCadreStrategique } from "../allTypes";

export interface NiveauCadreStrategiqueFormData {
  nombre_nsc: number;
  libelle_nsc: string;
  code_number_nsc: number;
  type_niveau: number;
  programme?: string;
}

export const niveauCadreStrategiqueService = {
  // Récupérer tous les niveaux
  async getAll(): Promise<NiveauCadreStrategique[]> {
    try {
      const response = await apiClient.request<NiveauCadreStrategique[]>(
        "/niveau_cadre_strategique/",
      );
      response.sort((a, b) => a.nombre_nsc - b.nombre_nsc);
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des niveaux");
      throw error;
    }
  },

  // Récupérer un niveau par ID
  async getById(id_nsc: number): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      `/niveau_cadre_strategique/${id_nsc}/`,
    );
  },

  // Créer un nouveau niveau
  async create(
    data: NiveauCadreStrategiqueFormData,
  ): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      "/niveau_cadre_strategique/",
      {
        method: "POST",
        data,
      },
    );
  },

  // Mettre à jour un niveau
  async update(
    id_nsc: number,
    data: NiveauCadreStrategiqueFormData,
  ): Promise<NiveauCadreStrategique> {
    return await apiClient.request<NiveauCadreStrategique>(
      `/niveau_cadre_strategique/${id_nsc}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  // Supprimer un niveau
  async delete(id_nsc: number): Promise<void> {
    await apiClient.request<void>(`/niveau_cadre_strategique/${id_nsc}/`, {
      method: "DELETE",
    });
  },
};
