import { apiClient } from "@/axios/api";
import type { IndicateurPerformanceProjet } from "../allTypes";

const prefix = "/indicateurs-performance-projet/"

const indicateurPerformanceProjetService = {
  /**
   * Récupère tous les indicateurs de performance
   */

  async getAll(): Promise<IndicateurPerformanceProjet[]> {
    return apiClient.request(prefix, {
      method: "GET",
    });
  },

  /**
   * Récupère un indicateur par son ID
   */
  async getById(id: number): Promise<IndicateurPerformanceProjet> {
    return apiClient.request(`${prefix}${id}/`, {
      method: "GET",
    });
  },

  /**
   * Récupère un indicateur par son code
   */
  async getByCode(code: string): Promise<IndicateurPerformanceProjet> {
    const response = await apiClient.request<IndicateurPerformanceProjet[]>(
      prefix,
      {
        method: "GET",
        params: { code_indicateur_performance: code },
      },
    );
    return response[0];
  },

  /**
   * Récupère les indicateurs par activité projet
   */
  async getByActiviteProjet(
    codeActivite: string,
  ): Promise<IndicateurPerformanceProjet[]> {
    return apiClient.request(prefix, {
      method: "GET",
      params: { code_activite_projet: codeActivite },
    });
  },

  /**
   * Crée un nouvel indicateur de performance
   */
  async create(
    data: Omit<IndicateurPerformanceProjet, "id_indicateur_performance">,
  ): Promise<IndicateurPerformanceProjet> {
    return apiClient.request(prefix+ "with-cibles/", {
      method: "POST",
      data,
    });
  },

  /**
   * Met à jour un indicateur
   */
  async update(
    id: number,
    data: Partial<
      Omit<IndicateurPerformanceProjet, "id_indicateur_performance">
    >,
  ): Promise<IndicateurPerformanceProjet> {
    return apiClient.request(`${prefix}${id}/with-cibles/`, {
      method: "PATCH",
      data,
    });
  },

  /**
   * Supprime un indicateur
   */
  async delete(id: number): Promise<void> {
    await apiClient.request(`${prefix}${id}/`, {
      method: "DELETE",
    });
  },

  /**
   * Recherche des indicateurs
   */
  async search(query: string): Promise<IndicateurPerformanceProjet[]> {
    return apiClient.request(prefix, {
      method: "GET",
      params: { search: query },
    });
  },
};

export default indicateurPerformanceProjetService;
