import { apiClient } from "@/axios/api";
import type { CibleCmrProjet } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

export interface CibleCmrProjetFormData {
  annee: string;
  valeur_cible_indcateur_crp: number;
  code_indicateur_crp?: number | null;
  code_ug?: string | null;
  code_projet?: string | null;
}

export const cibleCmrProjetService = {
  async getAll(): Promise<CibleCmrProjet[]> {
    const response = await apiClient.request<unknown>("/cible_cmr_projet/");
    const list = normalizeApiList<CibleCmrProjet>(response);
    return list.sort(
      (a, b) => new Date(a.annee).getTime() - new Date(b.annee).getTime(),
    );
  },

  async getById(id_cible_indicateur_crp: number): Promise<CibleCmrProjet> {
    return await apiClient.request<CibleCmrProjet>(
      `/cible_cmr_projet/${id_cible_indicateur_crp}/`,
    );
  },

  async create(data: CibleCmrProjetFormData): Promise<CibleCmrProjet> {
    return await apiClient.request<CibleCmrProjet>("/cible_cmr_projet/", {
      method: "POST",
      data,
    });
  },

  async update(
    id_cible_indicateur_crp: number,
    data: CibleCmrProjetFormData,
  ): Promise<CibleCmrProjet> {
    return await apiClient.request<CibleCmrProjet>(
      `/cible_cmr_projet/${id_cible_indicateur_crp}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  async delete(id_cible_indicateur_crp: number): Promise<void> {
    await apiClient.request<void>(
      `/cible_cmr_projet/${id_cible_indicateur_crp}/`,
      {
        method: "DELETE",
      },
    );
  },

  async search(query: string): Promise<CibleCmrProjet[]> {
    const response = await apiClient.request<unknown>(
      `/cible_cmr_projet/search/?q=${encodeURIComponent(query)}`,
    );
    return normalizeApiList<CibleCmrProjet>(response);
  },

  async getByIndicateur(
    code_indicateur_crp: number,
  ): Promise<CibleCmrProjet[]> {
    const response = await apiClient.request<unknown>(
      `/cible_cmr_projet/?code_indicateur_crp=${code_indicateur_crp}`,
    );
    return normalizeApiList<CibleCmrProjet>(response);
  },

  async getByProjet(code_projet: string): Promise<CibleCmrProjet[]> {
    const response = await apiClient.request<unknown>(
      `/cible_cmr_projet/?code_projet=${encodeURIComponent(code_projet)}`,
    );
    return normalizeApiList<CibleCmrProjet>(response);
  },

  async getByAnnee(annee: string): Promise<CibleCmrProjet[]> {
    const response = await apiClient.request<unknown>(
      `/cible_cmr_projet/?annee=${encodeURIComponent(annee)}`,
    );
    return normalizeApiList<CibleCmrProjet>(response);
  },
};
