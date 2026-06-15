import { apiClient } from "@/axios/api";
import { ZoneCollecte } from "../allTypes/zoneCollecte";

const BASE_URL = "/zones-collectes/";

export const zoneCollecteService = {
  // Récupérer toutes les zones de collecte
  async getAll(): Promise<ZoneCollecte[]> {
    return await apiClient.request<ZoneCollecte[]>(BASE_URL);
  },

  // Récupérer une zone par ID
  async getById(id: number): Promise<ZoneCollecte> {
    return await apiClient.request<ZoneCollecte>(`${BASE_URL}${id}/`);
  },

  // simadou/allSercices/zoneCollecteService.ts
  async create(data: ZoneCollecte, file?: File): Promise<ZoneCollecte> {
    if (file) {
      // Si un fichier est fourni, utiliser FormData
      const formData = new FormData();

      // Ajouter tous les champs du formulaire
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter le fichier avec la clé documentUrl
      formData.append("shape_file", file);

      return apiClient.request(BASE_URL, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      delete data.shape_file;
      // Pas de fichier, utiliser JSON normal
      return apiClient.request(BASE_URL, {
        method: "POST",
        data,
      });
    }
  },

  async update(
    id: number,
    data: Partial<ZoneCollecte>,
    file?: File,
  ): Promise<ZoneCollecte> {
    if (file) {
      // Si un fichier est fourni, utiliser FormData
      const formData = new FormData();

      // Ajouter tous les champs du formulaire
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter le fichier avec la clé documentUrl
      formData.append("shape_file", file);

      return apiClient.request(`${BASE_URL}${id}/`, {
        method: "PUT",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      delete data.shape_file;
      // Pas de fichier, utiliser JSON normal
      return apiClient.request(`${BASE_URL}${id}/`, {
        method: "PUT",
        data,
      });
    }
  },
  // Supprimer une zone
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  }
};
