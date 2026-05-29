import { apiClient } from "@/axios/api";
import type { IndicateurCmr, IndicateurCmrFormData } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export const indicateurCmrService = {
  getAll: async (): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>("/indicateur_cmr/");
    return normalizeApiList<IndicateurCmr>(response);
  },

  getById: async (id: number): Promise<IndicateurCmr> => {
    return await apiClient.request<IndicateurCmr>(`/indicateur_cmr/${id}/`);
  },

  getByResultat: async (resultatId: number): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cmr/?resultat_cmr=${resultatId}`,
    );
    return normalizeApiList<IndicateurCmr>(response);
  },

  getByResponsable: async (responsable: string): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cmr/?responsable_collecte_cmr=${encodeURIComponent(responsable)}`,
    );
    return normalizeApiList<IndicateurCmr>(response);
  },

  create: async (data: IndicateurCmrFormData): Promise<IndicateurCmr> => {
    return await apiClient.request<IndicateurCmr>("/indicateur_cmr/", {
      method: "POST",
      data,
    });
  },

  update: async (
    id: number,
    data: Partial<IndicateurCmrFormData>,
  ): Promise<IndicateurCmr> => {
    return await apiClient.request<IndicateurCmr>(`/indicateur_cmr/${id}/`, {
      method: "PUT",
      data,
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<IndicateurCmr>(`/indicateur_cmr/${id}/`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id: number): Promise<IndicateurCmr> => {
    return await apiClient.request<IndicateurCmr>(
      `/indicateur_cmr/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },
};
