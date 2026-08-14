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
    const response = await apiClient.request<unknown>("/cibles-cmr-projets/");
    const list = normalizeApiList<CibleCmrProjet>(response);
    return list.sort(
      (a, b) => new Date(a.annee).getTime() - new Date(b.annee).getTime(),
    );
  },

  async create(data: CibleCmrProjetFormData): Promise<CibleCmrProjet> {
    return await apiClient.request<CibleCmrProjet>("/cibles-cmr-projets/", {
      method: "POST",
      data,
    });
  },

  async update(
    id_cible_indicateur_crp: number,
    data: CibleCmrProjetFormData,
  ): Promise<CibleCmrProjet> {
    return await apiClient.request<CibleCmrProjet>(
      `/cibles-cmr-projets/${id_cible_indicateur_crp}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  async delete(id_cible_indicateur_crp: number): Promise<void> {
    await apiClient.request<void>(
      `/cibles-cmr-projets/${id_cible_indicateur_crp}/`,
      {
        method: "DELETE",
      },
    );
  },
};