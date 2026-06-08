import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import type { TypeZone } from "../allTypes";
import { TypeZoneFormData } from "../allTypes/entities";

export const typeZoneService = {
  // Récupérer tous les types de zone
  async getAll(): Promise<TypeZone[]> {
    try {
      const response = await apiClient.request<TypeZone[]>("/types-zones/");
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des types de zone");
      throw error;
    }
  },

  // Récupérer un type de zone par ID
  async getById(id: number): Promise<TypeZone> {
    try {
      const response = await apiClient.request<TypeZone>(`/types-zones/${id}/`);
      return response;
    } catch (error) {
      toast.error("Erreur lors de la récupération du type de zone");
      throw error;
    }
  },

  // Créer un nouveau type de zone
  async create(data: TypeZoneFormData): Promise<TypeZone> {
    try {
      const response = await apiClient.request<TypeZone>("/types-zones/", {
        method: "POST",
        data,
      });
      toast.success("Type de zone créé avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création du type de zone");
      throw error;
    }
  },

  // Mettre à jour un type de zone
  async update(id: number, data: TypeZoneFormData): Promise<TypeZone> {
    try {
      const response = await apiClient.request<TypeZone>(`/types-zones/${id}/`, {
        method: "PUT",
        data,
      });
      toast.success("Type de zone modifié avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la modification du type de zone");
      throw error;
    }
  },

  // Supprimer un type de zone
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>(`/types-zones/${id}/`, {
        method: "DELETE",
      });
      toast.success("Type de zone supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du type de zone");
      throw error;
    }
  },

  // Rechercher des types de zone
  async search(query: string): Promise<TypeZone[]> {
    try {
      const response = await apiClient.request<TypeZone[]>(
        `/types-zones/search/?q=${encodeURIComponent(query)}`,
      );
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la recherche de types de zone");
      throw error;
    }
  },
};
