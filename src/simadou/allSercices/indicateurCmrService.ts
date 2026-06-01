import { apiClient } from "@/axios/api";
import type { IndicateurCmr, IndicateurCmrFormData } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

/** L'API Django expose `Resultat_cmr` ; le front utilise `resultat_cmr`. */
function mapIndicateurCmrFromApi(raw: Record<string, unknown>): IndicateurCmr {
  const resultat =
    typeof raw.resultat_cmr === "string"
      ? raw.resultat_cmr
      : typeof raw.Resultat_cmr === "string"
        ? raw.Resultat_cmr
        : "";

  return {
    ...(raw as IndicateurCmr),
    resultat_cmr: resultat,
  };
}

function toIndicateurCmrApiPayload(
  data: Partial<IndicateurCmrFormData>,
): Record<string, unknown> {
  const { resultat_cmr, ...rest } = data;
  return {
    ...rest,
    ...(resultat_cmr !== undefined ? { Resultat_cmr: resultat_cmr } : {}),
  };
}

export const indicateurCmrService = {
  getAll: async (): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>("/indicateur_cmr/");
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  getById: async (id: number): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      `/indicateur_cmr/${id}/`,
    );
    return mapIndicateurCmrFromApi(response);
  },

  getByResultat: async (resultatId: number): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cmr/?resultat_cmr=${resultatId}`,
    );
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  getByResponsable: async (responsable: string): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `/indicateur_cmr/?responsable_collecte_cmr=${encodeURIComponent(responsable)}`,
    );
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  create: async (data: IndicateurCmrFormData): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      "/indicateur_cmr/",
      {
        method: "POST",
        data: toIndicateurCmrApiPayload(data),
      },
    );
    return mapIndicateurCmrFromApi(response);
  },

  update: async (
    id: number,
    data: Partial<IndicateurCmrFormData>,
  ): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      `/indicateur_cmr/${id}/`,
      {
        method: "PUT",
        data: toIndicateurCmrApiPayload(data),
      },
    );
    return mapIndicateurCmrFromApi(response);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<IndicateurCmr>(`/indicateur_cmr/${id}/`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id: number): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      `/indicateur_cmr/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
    return mapIndicateurCmrFromApi(response);
  },
};
