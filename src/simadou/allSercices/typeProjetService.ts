import { toast } from "sonner";
import { apiClient } from "@/axios/api";
import { TypeProjet } from "../allTypes/typeProjet";
import { TypeProjetFormData } from "../schemas/typeProjetSchema";

const BASE_URL = "/types-projets/"

export const TypeProjetService = {
  // Récupérer tous les types de  projet
  async getAll(): Promise<TypeProjet[]> {
    try {
      const response = await apiClient.request<TypeProjet[]>(BASE_URL);
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la récupération des types de  projet");
      throw error;
    }
  },

  // Récupérer un Type de projet par ID
  async getById(id: number): Promise<TypeProjet> {
    try {
      const response = await apiClient.request<TypeProjet>(`${BASE_URL} ${id}/`);
      return response;
    } catch (error) {
      toast.error("Erreur lors de la récupération du Type de projet");
      throw error;
    }
  },

  // Créer un nouveau Type de projet
  async create(data: TypeProjetFormData): Promise<TypeProjet> {
    try {
      const response = await apiClient.request<TypeProjet>(BASE_URL, {
        method: "POST",
        data,
      });
      toast.success("Type de projet créé avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la création du Type de projet");
      throw error;
    }
  },

  // Mettre à jour un Type de projet
  async update(id: number, data: TypeProjetFormData): Promise<TypeProjet> {
    try {
      const response = await apiClient.request<TypeProjet>(`${BASE_URL} ${id}/`, {
        method: "PUT",
        data,
      });
      toast.success("Type de projet modifié avec succès");
      return response;
    } catch (error) {
      toast.error("Erreur lors de la modification du Type de projet");
      throw error;
    }
  },

  // Supprimer un Type de projet
  async delete(id: number): Promise<void> {
    try {
      await apiClient.request<void>(`${BASE_URL}${id}/`, {
        method: "DELETE",
      });
      toast.success("Type de projet supprimé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression du Type de projet");
      throw error;
    }
  },

  // Rechercher des types de  projet
  async search(query: string): Promise<TypeProjet[]> {
    try {
      const response = await apiClient.request<TypeProjet[]>(
        `${BASE_URL}search/?q=${encodeURIComponent(query)}`,
      );
      return response || [];
    } catch (error) {
      toast.error("Erreur lors de la recherche de types de  projet");
      throw error;
    }
  },
};
