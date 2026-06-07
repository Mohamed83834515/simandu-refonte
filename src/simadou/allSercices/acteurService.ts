import { apiClient } from "@/axios/api";
import { Acteur, ActeurFormData } from "../allTypes";


  const BASE_URL = "/acteurs/"
export const acteurService = {
  // Get all acteurs
  getAll: async (): Promise<Acteur[]> => {
    const response = await apiClient.request<Acteur[]>(BASE_URL);
    return Array.isArray(response) ? response : [];
  },

  // Get acteur by ID
  getById: async (id: number): Promise<Acteur> => {
    return await apiClient.request<Acteur>(`${BASE_URL}${id}/`);
  },

  // Search acteurs by code
  searchByCode: async (code: string): Promise<Acteur[]> => {
    const response = await apiClient.request<Acteur[]>(
      `${BASE_URL}?code_acteur__icontains=${code}`,
    );
    return Array.isArray(response) ? response : [];
  },

  // Search acteurs by name
  searchByName: async (name: string): Promise<Acteur[]> => {
    const response = await apiClient.request<Acteur[]>(
      `${BASE_URL}?nom_acteur__icontains=${name}`,
    );
    return Array.isArray(response) ? response : [];
  },

  // Get acteurs by category
  getByCategory: async (categoryId: number): Promise<Acteur[]> => {
    const response = await apiClient.request<Acteur[]>(
      `${BASE_URL}?categorie_acteur=${categoryId}`,
    );
    return Array.isArray(response) ? response : [];
  },

  // Create new acteur
  create: async (data: ActeurFormData): Promise<Acteur> => {
    return await apiClient.request<Acteur>(BASE_URL, {
      method: "POST",
      data,
    });
  },

  // Update acteur
  update: async (
    id: number,
    data: Partial<ActeurFormData>,
  ): Promise<Acteur> => {
    return await apiClient.request<Acteur>(`${BASE_URL}${id}/`, {
      method: "PUT",
      data,
    });
  },

  // Delete acteur
  delete: async (id: number): Promise<void> => {
    await apiClient.request(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  },

  // Toggle status (if applicable)
  toggleStatus: async (id: number): Promise<Acteur> => {
    return await apiClient.request<Acteur>(`${BASE_URL}${id}/toggle_status/`, {
      method: "PATCH",
    });
  },
};
