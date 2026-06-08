import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { UniteIndicateur } from "../allTypes";
import { UniteIndicateurFormData } from "../allTypes/entities";

export const uniteIndicateurService = {
  // Get all unités d'indicateur
  getAll: async (): Promise<UniteIndicateur[]> => {
    try {
      const response =
        await apiClient.request<UniteIndicateur[]>("unite-indicateurs");
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des unités d'indicateur");
      throw error;
    }
  },

  // Get unité by ID
  getById: async (id: number): Promise<UniteIndicateur> => {
    try {
      return await apiClient.request<UniteIndicateur>(
        `unite-indicateurs${id}/`,
      );
    } catch (error) {
      toast.error("Erreur lors de la récupération de l'unité d'indicateur");
      throw error;
    }
  },

  // Create new unité
  create: async (data: UniteIndicateurFormData): Promise<UniteIndicateur> => {
    try {
      const response = await apiClient.request<UniteIndicateur>(
        "unite-indicateurs",
        {
          method: "POST",
          data,
        },
      );
      toast.success("Unité d'indicateur créée avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création de l'unité d'indicateur");
      throw error;
    }
  },

  // Update unité
  update: async (
    id: number,
    data: Partial<UniteIndicateurFormData>,
  ): Promise<UniteIndicateur> => {
    try {
      const response = await apiClient.request<UniteIndicateur>(
        `unite-indicateurs${id}/`,
        {
          method: "PUT",
          data,
        },
      );
      toast.success("Unité d'indicateur mise à jour avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'unité d'indicateur");
      throw error;
    }
  },

  // Delete unité
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.request(`unite-indicateurs${id}/`, {
        method: "DELETE",
      });
      toast.success("Unité d'indicateur supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'unité d'indicateur");
      throw error;
    }
  },
};
