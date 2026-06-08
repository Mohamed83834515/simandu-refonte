import { apiClient } from "@/axios/api";
import { TacheActivitePtbaFormData } from "../schemas/tacheActivitePtbaSchemas";
import type { TacheActivitePtba } from "../allTypes";

class TacheActivitePtbaService {
  async getAll(url:string): Promise<TacheActivitePtba[]> {
    const response = await apiClient.request<TacheActivitePtba[]>(
      url,
    );
    return response;
  }

  async getByActivite(url:string,idActivite: number): Promise<TacheActivitePtba[]> {
    const response = await apiClient.request<TacheActivitePtba[]>(
      `${url}?id_activite=${idActivite}`,
    );
    return response;
  }

  async getById(url:string, id: number): Promise<TacheActivitePtba> {
    const response = await apiClient.request<TacheActivitePtba>(
      `${url}${id}/`,
    );
    return response;
  }

  async create(url:string, data: TacheActivitePtbaFormData): Promise<TacheActivitePtba> {
    const response = await apiClient.request<TacheActivitePtba>(
      url,
      {
        method: "POST",
        data: { ...data, proportion_gt: data.proportion_gt?.toString() },
      },
    );
    return response;
  }

  async update(
    url:string,
    id: number,
    data: Partial<TacheActivitePtbaFormData>,
  ): Promise<TacheActivitePtba> {
    const response = await apiClient.request<TacheActivitePtba>(
      `${url}${id}/`,
      {
        method: "PUT",
        data: { ...data, proportion_gt: data.proportion_gt?.toString() },
      },
    );
    return response;
  }

  async delete(url:string, id: number): Promise<void> {
    await apiClient.request(`${url}${id}/`, {
      method: "DELETE",
    });
  }
}

export default new TacheActivitePtbaService();
