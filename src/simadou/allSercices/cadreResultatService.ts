import { apiClient } from "@/axios/api";
import type { CadreResultat, CadreResultatFormData } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";



export const cadreResultatService = {
  getAll: async (): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>("cadres-resultats/");
    return normalizeApiList<CadreResultat>(response);
  },

  getbyProjet: async (codeProjet: string): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(`cadres-resultats/?projet_cr=${codeProjet}`);
    return normalizeApiList<CadreResultat>(response);
  },

  getById: async (id: number): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(`/cadres-resultats/${id}/`);
  },

  getByNiveau: async (niveauId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadres-resultats/?niveau_cr=${niveauId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  getByParent: async (parentId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadres-resultats/?parent_cr=${parentId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  getByPartenaire: async (partenaireId: number): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadres-resultats/?partenaire_cr=${partenaireId}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  search: async (query: string): Promise<CadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/cadres-resultats/?search=${encodeURIComponent(query)}`,
    );
    return normalizeApiList<CadreResultat>(response);
  },

  create: async (
    data: CadreResultatFormData & { projet_cr?: string | number | null },
  ): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>("/cadres-resultats/", {
      method: "POST",
      data,
    });
  },

  update: async (
    id: number,
    data: Partial<CadreResultatFormData & { projet_cr?: string | number | null }>,
  ): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(`/cadres-resultats/${id}/`, {
      method: "PUT",
      data,
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request(`/cadres-resultats/${id}/`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id: number): Promise<CadreResultat> => {
    return await apiClient.request<CadreResultat>(
      `/cadres-resultats/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },
};
