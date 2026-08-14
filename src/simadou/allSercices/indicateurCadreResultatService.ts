import { apiClient } from "@/axios/api";
import type {
  IndicateurCadreResultat,
  IndicateurCadreResultatFormData,
} from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export const indicateurCadreResultatService = {
  getAll: async (): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      "/indicateurs-cadre-resultats/",
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  getById: async (id: number): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      `/indicateurs-cadre-resultats/${id}/`,
    );
  },

  getByCadre: async (cadreId: number): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateurs-cadre-resultats/?id_cadre_secteur=${cadreId}`,
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  getByNiveau: async (niveau: number): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateurs-cadre-resultats/?niveau_cr=${niveau}`,
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  create: async (
    data: IndicateurCadreResultatFormData,
  ): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      "/indicateurs-cadre-resultats/",
      {
        method: "POST",
        data,
      },
    );
  },

  update: async (
    id: number,
    data: Partial<IndicateurCadreResultatFormData>,
  ): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      `/indicateurs-cadre-resultats/${id}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<IndicateurCadreResultat>(
      `/indicateurs-cadre-resultats/${id}/`,
      { method: "DELETE" },
    );
  },

  toggleStatus: async (id: number): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      `/indicateurs-cadre-resultats/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },
};
