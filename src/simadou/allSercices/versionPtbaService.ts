import { apiClient } from "@/axios/api";
import type { VersionPtba } from "../allTypes";
import type { VersionPtbasProjetsResponse } from "../allTypes/ptbaProjet";
import type { VersionPtbaFormData } from "../schemas/ptbaSchemas";

const ENDPOINT = "/versions-ptbas/";

const versionPtbaService = {
  async getAll(): Promise<VersionPtba[]> {
    return apiClient.request(`${ENDPOINT}list/`, { method: "GET" });
  },

  async getById(id: number): Promise<VersionPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, { method: "GET" });
  },

  async getPtbasProjets(
    idVersion: number,
    codeProjet?: string,
  ): Promise<VersionPtbasProjetsResponse> {
    const params =
      codeProjet?.trim()
        ? { code_projet: codeProjet.trim() }
        : undefined

    return apiClient.request(`${ENDPOINT}${idVersion}/ptbas-projets/`, {
      method: "GET",
      params,
    });
  },

  async create(data: VersionPtbaFormData, file?: File): Promise<VersionPtba> {
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
      formData.append("documentUrl", file);

      return apiClient.request(ENDPOINT, {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      delete data.documentUrl;
      // Pas de fichier, utiliser JSON normal
      return apiClient.request(ENDPOINT, {
        method: "POST",
        data,
      });
    }
  },

  async update(
    id: number,
    data: Partial<VersionPtbaFormData>,
    file?: File,
  ): Promise<VersionPtba> {
    if (typeof file !== 'string' && file instanceof File) {
      // Si un fichier est fourni, utiliser FormData
      const formData = new FormData();

      // Ajouter tous les champs du formulaire
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter le fichier avec la clé documentUrl
      formData.append("documentUrl", file);

      return apiClient.request(`${ENDPOINT}${id}/`, {
        method: "PUT",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      delete data.documentUrl;
      // Pas de fichier, utiliser JSON normal
      return apiClient.request(`${ENDPOINT}${id}/`, {
        method: "PUT",
        data,
      });
    }
  },

  async delete(id: number): Promise<void> {
    await apiClient.request(`${ENDPOINT}${id}/`, {
      method: "DELETE",
    });
  },
  async valider(id: number): Promise<VersionPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PATCH",
      data: { statut_version: 1 }
    });
  },

  async archiver(id: number): Promise<VersionPtba> {
    return apiClient.request(`${ENDPOINT}${id}/`, {
      method: "PATCH",
      data: { statut_version: 2 }
    });
  },
};

export default versionPtbaService;
