import { apiClient } from "@/axios/api";
import type {
  NiveauCadreResultat,
  NiveauCadreResultatFormData,
} from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export const niveauCadreResultatService = {
  getAll: async (): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>("/niveau_cadre_resultat/");
    return normalizeApiList<NiveauCadreResultat>(response).sort(
      (a, b) => a.nombre_ncr - b.nombre_ncr,
    );
  },

  getById: async (id: number): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      `/niveau_cadre_resultat/${id}/`,
    );
  },

  getByType: async (type: 1 | 2 | 3): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/niveau_cadre_resultat/?type_niveau=${type}`,
    );
    return normalizeApiList<NiveauCadreResultat>(response);
  },

  search: async (query: string): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/niveau_cadre_resultat/?search=${encodeURIComponent(query)}`,
    );
    return normalizeApiList<NiveauCadreResultat>(response);
  },

  create: async (
    data: NiveauCadreResultatFormData,
  ): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      "/niveau_cadre_resultat/",
      {
        method: "POST",
        data,
      },
    );
  },

  update: async (
    id: number,
    data: Partial<NiveauCadreResultatFormData>,
  ): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      `/niveau_cadre_resultat/${id}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request(`/niveau_cadre_resultat/${id}/`, {
      method: "DELETE",
    });
  },
};
