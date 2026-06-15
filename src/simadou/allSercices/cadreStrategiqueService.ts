import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { CadreStrategique, CadreStrategiqueFormData } from "../allTypes";

export const cadreStrategiqueService = {
  // Get all cadres strategiques
  getAll: async (programmeId?: number): Promise<CadreStrategique[]> => {
    try {
      const url = programmeId
        ? `/cadres-strategiques/?programme_cs=${programmeId}`
        : "/cadres-strategiques/";
      const response = await apiClient.request<CadreStrategique[]>(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des cadres stratégiques");
      throw error;
    }
  },

  // Get cadre strategique by ID
  getById: async (id: number): Promise<CadreStrategique> => {
    try {
      return await apiClient.request<CadreStrategique>(
        `/cadres-strategiques/${id}/`,
      );
    } catch (error) {
      toast.error("Erreur lors de la récupération du cadre stratégique");
      throw error;
    }
  },

  // Get hierarchy of cadres strategiques
  getHierarchy: async (): Promise<CadreStrategique[]> => {
    try {
      const response = await apiClient.request<CadreStrategique[]>(
        "/cadres-strategiques/hierarchy/",
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération de la hiérarchie");
      throw error;
    }
  },

  // Get cadres by parent
  getByParent: async (parentId: number | null): Promise<CadreStrategique[]> => {
    try {
      const url = parentId
        ? `/cadres-strategiques/parent/${parentId}/`
        : "/cadres-strategiques/root/";
      const response = await apiClient.request<CadreStrategique[]>(url);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des cadres par parent");
      throw error;
    }
  },

  // Get cadres by niveau
  getByNiveau: async (niveau: number): Promise<CadreStrategique[]> => {
    try {
      const response = await apiClient.request<CadreStrategique[]>(
        `/cadres-strategiques/?niveau_cs=${niveau}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des cadres par niveau");
      throw error;
    }
  },

  // Get cadres by projet
  getByProjet: async (projetId: number): Promise<CadreStrategique[]> => {
    try {
      const response = await apiClient.request<CadreStrategique[]>(
        `/cadres-strategiques/?projet_cs=${projetId}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des cadres par projet");
      throw error;
    }
  },

  // Search by code
  searchByCode: async (code: string): Promise<CadreStrategique[]> => {
    try {
      const response = await apiClient.request<CadreStrategique[]>(
        `/cadres-strategiques/?code_cs__icontains=${code}`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la recherche par code");
      throw error;
    }
  },

  // Create new cadre strategique
  create: async (data: CadreStrategiqueFormData): Promise<CadreStrategique> => {
    return await apiClient.request<CadreStrategique>("/cadres-strategiques/", {
      method: "POST",
      data,
    });
  },

  // Update cadre strategique
  update: async (
    id: number,
    data: Partial<CadreStrategiqueFormData>,
  ): Promise<CadreStrategique> => {
    return await apiClient.request<CadreStrategique>(
      `/cadres-strategiques/${id}/`,
      {
        method: "PUT",
        data,
      },
    );
  },

  // Delete cadre strategique
  delete: async (id: number): Promise<void> => {
    await apiClient.request(`/cadres-strategiques/${id}/`, {
      method: "DELETE",
    });
  },

  // Toggle status
  toggleStatus: async (id: number): Promise<CadreStrategique> => {
    return await apiClient.request<CadreStrategique>(
      `/cadres-strategiques/${id}/toggle_status/`,
      {
        method: "PATCH",
      },
    );
  },

  // Get children of a cadre
  getChildren: async (parentId: number): Promise<CadreStrategique[]> => {
    try {
      const response = await apiClient.request<CadreStrategique[]>(
        `/cadres-strategiques/children/${parentId}/`,
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des enfants");
      throw error;
    }
  },

  // Validate code uniqueness
  validateCode: async (code: string, excludeId?: number): Promise<boolean> => {
    try {
      const response = await apiClient.request<{ isUnique: boolean }>(
        "/cadres-strategiques/validate_code/",
        {
          method: "POST",
          data: { code_cs: code, exclude_id: excludeId },
        },
      );
      return response.isUnique;
    } catch (error) {
      console.error("Erreur lors de la validation du code:", error);
      return false;
    }
  },
};
