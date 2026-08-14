import { apiClient } from "@/axios/api";
import { VersionPPMFormData } from "../schemas/ppmShema";
import { VersionPPM } from "../allTypes/versionPPM";
const ENDPOINT = "/versions-ppm/";

const versionPPMService = {
  async getAll(): Promise<VersionPPM[]> {
    return apiClient.request(ENDPOINT, { method: "GET" });
  },

  async getById(id: number): Promise<VersionPPM> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
  },

  async create(data: VersionPPMFormData): Promise<VersionPPM> {
    // Pas de fichier, utiliser JSON normal
      return apiClient.request(ENDPOINT, {
        method: "POST",
        data,
      });
  },

  async update(
    id: number,
    data: Partial<VersionPPMFormData>,
  ): Promise<VersionPPM> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
        method: "PUT",
        data,
      });
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  }
};

export default versionPPMService;
