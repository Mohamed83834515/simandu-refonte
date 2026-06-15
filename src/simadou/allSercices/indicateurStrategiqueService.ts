import { apiClient } from "@/axios/api";
import { IndicateurStrategique } from "../allTypes/indicateurStrategique";

const BASE_URL = "/indicateur_strategique/";

export const indicateurStrategiqueService = {
  // Récupérer tous les indicateurs stratégiques
  async getAll(): Promise<IndicateurStrategique[]> {
    return await apiClient.request<IndicateurStrategique[]>(BASE_URL);
  },

  // Créer un nouvel indicateur
  async create(
    data: Omit<IndicateurStrategique, "id_indicateur_str">
  ): Promise<IndicateurStrategique> {
    return await apiClient.request<IndicateurStrategique>(BASE_URL, {
      method: "POST",
      data,
    });
  },

  // Mettre à jour un indicateur
  async update(
    id: number,
    data: Partial<IndicateurStrategique>
  ): Promise<IndicateurStrategique> {
    return await apiClient.request<IndicateurStrategique>(`${BASE_URL}${id}/`, {
      method: "PUT",
      data,
    });
  },

  // Supprimer un indicateur
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  }
};
