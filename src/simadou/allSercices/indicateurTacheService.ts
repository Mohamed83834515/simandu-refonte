import { apiClient } from "@/axios/api";
import type {
  IndicateurTache,
  IndicateurTacheRequest,
} from "../allTypes/indicateurTache";
import { filterIndicateursByActivite } from "../lib/indicateurTacheUtils";

class IndicateurTacheService {
  async getAll(url: string): Promise<IndicateurTache[]> {
    const response = await apiClient.request<IndicateurTache[]>(
      url
    );
    return response;
  }
  async getByActivite(url: string, idActivite: number): Promise<IndicateurTache[]> {
    const response = await apiClient.request<IndicateurTache[]>(`${url}?id_activite=${idActivite}`);
    return filterIndicateursByActivite(response, idActivite);
  }

  async getByTache(url: string, idTache: number): Promise<IndicateurTache[]> {
    const response = await apiClient.request<IndicateurTache[]>(
      `${url}?tache=${idTache}`
    );
    return response;
  }

  async getById(url: string, id: number): Promise<IndicateurTache> {
    const response = await apiClient.request<IndicateurTache>(
      `${url}${id}/`
    );
    return response;
  }

  async create(url: string, data: IndicateurTacheRequest): Promise<IndicateurTache> {
    const response = await apiClient.request<IndicateurTache>(
      url,
      {
        method: "POST",
        data,
      }
    );
    return response;
  }

  async update(
    url: string,
    id: number,
    data: Partial<IndicateurTacheRequest>
  ): Promise<IndicateurTache> {
    const response = await apiClient.request<IndicateurTache>(
      `${url}${id}/`,
      {
        method: "PUT",
        data,
      }
    );
    return response;
  }

  async delete(url: string, id: number): Promise<void> {
    await apiClient.request(`${url}${id}/`, {
      method: "DELETE",
    });
  }
}

export default new IndicateurTacheService();
