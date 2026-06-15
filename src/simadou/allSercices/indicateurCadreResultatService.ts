import { apiClient } from "@/axios/api";
import type {
  IndicateurCadreResultat,
  IndicateurCadreResultatFormData,
} from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export const indicateurCadreResultatService = {
  getAll: async (): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      "/indicateur_cadre_resultat/",
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  getById: async (id: number): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      `/indicateur_cadre_resultat/${id}/`,
    );
  },

  getByCadre: async (cadreId: number): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cadre_resultat/?id_cadre_secteur=${cadreId}`,
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  getByNiveau: async (niveau: number): Promise<IndicateurCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cadre_resultat/?niveau_cr=${niveau}`,
    );
    return normalizeApiList<IndicateurCadreResultat>(response);
  },

  create: async (
    data: IndicateurCadreResultatFormData,
  ): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      "/indicateur_cadre_resultat/",
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
      `/indicateur_cadre_resultat/${id}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<IndicateurCadreResultat>(
      `/indicateur_cadre_resultat/${id}/`,
      { method: "DELETE" },
    );
  },

  toggleStatus: async (id: number): Promise<IndicateurCadreResultat> => {
    return await apiClient.request<IndicateurCadreResultat>(
      `/indicateur_cadre_resultat/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },
};
