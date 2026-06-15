import { apiClient } from "@/axios/api";
import { SuiviIndicateurActiviteFormData } from "../schemas/suiviIndicateurSchemas";
import type { SuiviIndicateurActivite } from "../allTypes";

const ENDPOINT = "/suivi_indicateur_activite/";

const suiviIndicateurActiviteService = {
  /**
   * Récupère tous les suivis d'indicateurs
   */
  async getAll(): Promise<SuiviIndicateurActivite[]> {
    return apiClient.request(ENDPOINT, { method: "GET" });
  },

  /**
   * Récupère un suivi par son ID
   */
  async getById(id: number): Promise<SuiviIndicateurActivite> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
  },

  /**
   * Récupère tous les suivis pour un indicateur spécifique
   */
  async getByIndicateur(
    codeIndicateur: string,
  ): Promise<SuiviIndicateurActivite[]> {
    const response = await this.getAll();
    const filteredResponse = response.filter((suivi) => {
      if (typeof suivi.indicateur_activite === "string") {
        return suivi.indicateur_activite === codeIndicateur;
      }
      if (
        typeof suivi.indicateur_activite === "object" &&
        suivi.indicateur_activite
      ) {
        const obj = suivi.indicateur_activite as Record<string, unknown>;
        return (
          obj.code_indicateur_activite === codeIndicateur ||
          obj.code_indicateur_ptba === codeIndicateur
        );
      }
      return false;
    });
    return filteredResponse;
  },

  /**
   * Récupère tous les suivis pour une localité spécifique
   */
  async getByLocalite(
    codeLocalite: string,
  ): Promise<SuiviIndicateurActivite[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: { localite: codeLocalite },
    });
  },

  /**
   * Récupère les suivis par période
   */
  async getByPeriode(
    dateDebut: string,
    dateFin: string,
  ): Promise<SuiviIndicateurActivite[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: {
        date_debut: dateDebut,
        date_fin: dateFin,
      },
    });
  },

  /**
   * Crée un nouveau suivi d'indicateur
   */
  async create(
    data: SuiviIndicateurActiviteFormData,
  ): Promise<SuiviIndicateurActivite> {
    return apiClient.request(ENDPOINT, {
      method: "POST",
      data,
    });
  },

  /**
   * Met à jour un suivi existant
   */
  async update(
    id: number,
    data: Partial<SuiviIndicateurActiviteFormData>,
  ): Promise<SuiviIndicateurActivite> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PUT",
      data,
    });
  },

  /**
   * Met à jour partiellement un suivi
   */
  async patch(
    id: number,
    data: Partial<SuiviIndicateurActiviteFormData>,
  ): Promise<SuiviIndicateurActivite> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PATCH",
      data,
    });
  },

  /**
   * Supprime un suivi
   */
  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default suiviIndicateurActiviteService;
