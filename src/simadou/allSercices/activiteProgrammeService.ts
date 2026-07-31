import { apiClient } from "@/axios/api";
import { ActiviteProgrammeFormData } from "../schemas/activiteProgrammeSchemas";
import type { ActiviteProgramme } from "../allTypes/activiteProgramme";

const BASE_URL = "/activites-programmes/";

const activiteProgrammeService = {
  // Récupérer toutes les activités programme
  async getAll(id_programme?: number): Promise<ActiviteProgramme[]> {
    const response = await apiClient.request<ActiviteProgramme[]>(BASE_URL);
    if (id_programme) {
      const filteredResponse = response.filter(
        (ap) => ap.id_programme === id_programme,
      );
      return filteredResponse;
    }
    return response;
  },

  // Récupérer une activité programme par ID
  async getById(id: number): Promise<ActiviteProgramme> {
    const response = await apiClient.request<ActiviteProgramme>(
      `${BASE_URL}${id}/`,
    );
    return response;
  },

  // Récupérer les activités programme par programme
  async getByProgramme(idProgramme: number): Promise<ActiviteProgramme[]> {
    const response = await apiClient.request<ActiviteProgramme[]>(
      `${BASE_URL}?id_programme=${idProgramme}`,
    );
    return response;
  },

  // Récupérer les activités programme par niveau
  async getByNiveau(niveau: number): Promise<ActiviteProgramme[]> {
    const response = await apiClient.request<ActiviteProgramme[]>(
      `${BASE_URL}?niveau_ap=${niveau}`,
    );
    return response;
  },

  // Créer une nouvelle activité programme
  async create(data: ActiviteProgrammeFormData): Promise<ActiviteProgramme> {
    const response = await apiClient.request<ActiviteProgramme>(BASE_URL, {
      method: "POST",
      data,
    });
    return response;
  },

  // Mettre à jour une activité programme
  async update(
    id: number,
    data: Partial<ActiviteProgrammeFormData>,
  ): Promise<ActiviteProgramme> {
    const response = await apiClient.request<ActiviteProgramme>(
      `${BASE_URL}${id}/`,
      {
        method: "PUT",
        data,
      },
    );
    return response;
  },

  // Supprimer une activité programme
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  },
};

export default activiteProgrammeService;
