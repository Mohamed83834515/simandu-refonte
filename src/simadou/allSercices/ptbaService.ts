import { apiClient } from "@/axios/api";
import { PtbaFormData } from "../schemas/ptbaSchemas";
import type { Ptba } from "../allTypes";
import { buildPtbaApiPayload } from "@/simadou/lib/ptbaFormUtils";

const ENDPOINT = "/ptbas/";

const ptbaService = {
  async getAll(codeProgramme?: string): Promise<Ptba[]> {
    return apiClient.request(ENDPOINT, {
      method: "GET",
      params: codeProgramme ? { code_programme: codeProgramme } : {},
    });
  },

  async getById(id: number): Promise<Ptba> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
  },

  async create(data: PtbaFormData): Promise<Ptba> {
    return apiClient.request(ENDPOINT, {
      method: "POST",
      data: buildPtbaApiPayload(data),
    });
  },

  async update(id: number, data: Partial<PtbaFormData>): Promise<Ptba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PUT",
      data: buildPtbaApiPayload(data as PtbaFormData),
    });
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
};

export default ptbaService;
