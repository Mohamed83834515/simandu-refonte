import { apiClient } from "@/axios/api";
import type { IndicateurActivitePtba } from "../allTypes";
import { IndicateurActivitePtbaFormData } from "../schemas/activiteProjetSchemas";

const ENDPOINT = "/indicateur_activite_ptba/";

const indicateurActivitePtbaService = {
  /**
   * Récupère tous les indicateurs d'activité PTBA
   */
  async getAll(): Promise<IndicateurActivitePtba[]> {
    return apiClient.request(ENDPOINT, { method: "GET" });
  },

  /**
   * Récupère un indicateur par son ID
   */
  async getById(id: number): Promise<IndicateurActivitePtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "GET",
    });
  },

  /**
   * Récupère un indicateur par son code
   */
  async getByCode(code: string): Promise<IndicateurActivitePtba> {
    const response = await apiClient.request<IndicateurActivitePtba[]>(
      ENDPOINT,
      {
        method: "GET",
        params: { code_indicateur_activite: code },
      },
    );
    return response[0];
  },

  /**
   * Récupère tous les indicateurs pour une activité PTBA spécifique
   */
  async getByActivite(activiteCode: string): Promise<IndicateurActivitePtba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: { activite_ptba: activiteCode },
    });
  },

  /**
   * Récupère tous les indicateurs pour une activité PTBA par ID
   */
  async getByActiviteId(activiteId: number): Promise<IndicateurActivitePtba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: { activite_ptba_id: activiteId },
    });
  },

  /**
   * Récupère les indicateurs par indicateur de performance
   */
  async getByIndicateurPerformance(
    codeIndicateurPerformance: string,
  ): Promise<IndicateurActivitePtba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: { code_indicateur_performance: codeIndicateurPerformance },
    });
  },

  /**
   * Récupère les indicateurs par unité
   */
  async getByUnite(uniteId: number): Promise<IndicateurActivitePtba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: { abrege_unite: uniteId },
    });
  },

  /**
   * Récupère les indicateurs pour une activité PTBA (code puis repli par id).
   */
  async getForActivite(activite: {
    code_activite_ptba?: string
    id_ptba?: number
  }): Promise<IndicateurActivitePtba[]> {
    if (activite.code_activite_ptba) {
      const byCode = await this.getByActivite(activite.code_activite_ptba)
      if (byCode.length > 0) return byCode
    }
    if (Number.isFinite(activite.id_ptba)) {
      return this.getByActiviteId(activite.id_ptba!)
    }
    return []
  },

  /**
   * Crée un nouveau indicateur d'activité PTBA
   */
  async create(
    data: IndicateurActivitePtbaFormData,
  ): Promise<IndicateurActivitePtba> {
    return apiClient.request(ENDPOINT, {
      method: "POST",
      data,
    });
  },

  /**
   * Met à jour un indicateur existant
   */
  async update(
    id: number,
    data: Partial<IndicateurActivitePtbaFormData>,
  ): Promise<IndicateurActivitePtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PUT",
      data,
    });
  },

  /**
   * Met à jour partiellement un indicateur
   */
  async patch(
    id: number,
    data: Partial<IndicateurActivitePtbaFormData>,
  ): Promise<IndicateurActivitePtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PATCH",
      data,
    });
  },

  /**
   * Supprime un indicateur
   */
  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default indicateurActivitePtbaService;
