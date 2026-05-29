import { apiClient } from "@/axios/api";
import type { CadreResultat, CadreResultatFormData } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export const cadreResultatService = {
  getAll: async (): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>("cadre_resultat/");
    return normalizeApiList<CadreResultat>(response);
  },

  getById: async (id: number): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(`/cadre_resultat/${id}/`);
  },

  getByNiveau: async (niveauId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadre_resultat/?niveau_cr=${niveauId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  getByParent: async (parentId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadre_resultat/?parent_cr=${parentId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  getByPartenaire: async (partenaireId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadre_resultat/?partenaire_cr=${partenaireId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  search: async (query: string): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadre_resultat/?search=${encodeURIComponent(query)}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  create: async (
    data: CadreResultatFormData & { projet_cr?: string | number | null },
  ): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>("/cadre_resultat/", {
      method: "POST",
      data,
    });
  },

  update: async (
    id: number,
    data: Partial<CadreResultatFormData & { projet_cr?: string | number | null }>,
  ): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(`/cadre_resultat/${id}/`, {
      method: "PUT",
      data,
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request(`/cadre_resultat/${id}/`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id: number): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(
      `/cadre_resultat/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },
};
