import { apiClient } from "@/axios/api";
import type { IndicateurCmr, IndicateurCmrFormData } from "../allTypes";
import { normalizeApiList } from "./apiListUtils";

const BASE_URL = "/indicateurs-cmr/";

function mapIndicateurCmrFromApi(raw: Record<string, unknown>): IndicateurCmr {
  const rawResultat = raw.resultat_cmr ?? raw.Resultat_cmr;

  return {
    ...(raw as IndicateurCmr),
    ...(rawResultat !== undefined && rawResultat !== null
      ? { resultat_cmr: rawResultat as IndicateurCmr["resultat_cmr"] }
      : {}),
  };
}

function toIndicateurCmrApiPayload(
  data: Partial<IndicateurCmrFormData>,
): Record<string, unknown> {
  const { resultat_cmr, referentiel_cmr, ...rest } = data;
  return {
    ...rest,
    ...(resultat_cmr !== undefined ? { resultat_cmr } : {}),
    ...(referentiel_cmr !== undefined
      ? { referentiel_cmr: referentiel_cmr ?? null }
      : {}),
  };
}

export const indicateurCmrService = {
  getAll: async (): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(BASE_URL);
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  getById: async (id: number): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      `${BASE_URL}${id}/`,
    );
    return mapIndicateurCmrFromApi(response);
  },

  getByResultat: async (resultatId: number): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `${BASE_URL}?resultat_cmr=${resultatId}`,
    );
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  getByResponsable: async (responsable: string): Promise<IndicateurCmr[]> => {
    const response = await apiClient.request<unknown>(
      `${BASE_URL}?responsable_collecte_cmr=${encodeURIComponent(responsable)}`,
    );
    return normalizeApiList<Record<string, unknown>>(response).map(
      mapIndicateurCmrFromApi,
    );
  },

  create: async (data: IndicateurCmrFormData): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      BASE_URL,
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
      `${BASE_URL}${id}/`,
      {
        method: "PUT",
        data: toIndicateurCmrApiPayload(data),
      },
    );
    return mapIndicateurCmrFromApi(response);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request<IndicateurCmr>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  },

  toggleStatus: async (id: number): Promise<IndicateurCmr> => {
    const response = await apiClient.request<Record<string, unknown>>(
      `${BASE_URL}${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
    return mapIndicateurCmrFromApi(response);
  },
};