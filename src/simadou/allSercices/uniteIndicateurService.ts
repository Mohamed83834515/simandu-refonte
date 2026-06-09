import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { UniteIndicateur } from "../allTypes";
import { UniteIndicateurFormData } from "../allTypes/entities";
 
const BASE_URL = "/unite-indicateurs/"

export const uniteIndicateurService = {
  async getAll(): Promise<UniteIndicateur[]> {
    try {
      const response =
        await apiClient.request<UniteIndicateur[]>(BASE_URL);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des unités d'indicateur")
      throw error
    }
  },

  async getById(id: number): Promise<UniteIndicateur> {
    try {
      return await apiClient.request<UniteIndicateur>(
        `${BASE_URL}${id}/`,
      );
    } catch (error) {
      toast.error("Erreur lors de la récupération de l'unité d'indicateur")
      throw error
    }
  },

  async create(data: UniteIndicateurFormData): Promise<UniteIndicateur> {
    try {
      const response = await apiClient.request<UniteIndicateur>(
       BASE_URL,
        {
          method: "POST",
          data,
        },
      );
      toast.success("Unité d'indicateur créée avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création de l'unité d'indicateur")
      throw error
    }
  },

  async update(
    id: number,
    data: Partial<UniteIndicateurFormData>
  ): Promise<UniteIndicateur> {
    try {
      const response = await apiClient.request<UniteIndicateur>(
        `${BASE_URL}${id}/`,
        {
          method: 'PUT',
          data,
        }
      )
      toast.success("Unité d'indicateur mise à jour avec succès")
      return response
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'unité d'indicateur")
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await apiClient.request(`${BASE_URL}${id}/`, {
        method: "DELETE",
      });
      toast.success("Unité d'indicateur supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'unité d'indicateur")
      throw error
    }
  },
}
