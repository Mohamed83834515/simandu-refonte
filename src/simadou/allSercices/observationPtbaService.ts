import { apiClient } from "@/axios/api";
import { ObservationPtbaFormData } from "../schemas/observationPtbaSchemas";
import type { ObservationPtba } from "../allTypes";
import { filterObservationsByActiviteCode } from "../lib/observationPtbaUtils";

const ENDPOINT = "/observations-ptbas/";

const observationPtbaService = {
  /**
   * Récupère toutes les observations
   */
  async getAll(): Promise<ObservationPtba[]> {
    return apiClient.request(ENDPOINT, { method: "GET" });
  },

  /**
   * Récupère une observation par son ID
   */
  async getById(id: number): Promise<ObservationPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
  },

  /**
   * Récupère toutes les observations pour une activité PTBA spécifique
   */
  async getByActivite(codeActivite: string): Promise<ObservationPtba[]> {
    const all = await this.getAll();
    return filterObservationsByActiviteCode(all, codeActivite);
  },

  /**
   * Récupère les observations par période
   */
  async getByPeriode(
    dateDebut: string,
    dateFin: string,
  ): Promise<ObservationPtba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: {
        date_debut: dateDebut,
        date_fin: dateFin,
      },
    });
  },

  /**
   * Crée une nouvelle observation
   */
  async create(data: ObservationPtbaFormData): Promise<ObservationPtba> {
    return apiClient.request(ENDPOINT, {
      method: "POST",
      data,
    });
  },

  /**
   * Met à jour une observation existante
   */
  async update(
    id: number,
    data: Partial<ObservationPtbaFormData>,
  ): Promise<ObservationPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PUT",
      data,
    });
  },

  /**
   * Met à jour partiellement une observation
   */
  async patch(
    id: number,
    data: Partial<ObservationPtbaFormData>,
  ): Promise<ObservationPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PATCH",
      data,
    });
  },

  /**
   * Supprime une observation
   */
  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default observationPtbaService;
