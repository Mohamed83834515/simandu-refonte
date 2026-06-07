import { apiClient } from "@/axios/api";
import { CategorieActeur } from "../allTypes/categorieActeur";

const BASE_URL = "/categories-acteurs/";

export const categorieActeurService = {
  // Récupérer toutes les catégories d'acteurs
  async getAll(): Promise<CategorieActeur[]> {
    return await apiClient.request<CategorieActeur[]>(BASE_URL);
  },

  // Créer une nouvelle catégorie
  async create(data: CategorieActeur): Promise<CategorieActeur> {
    const { ...form } = data;
    return await apiClient.request<CategorieActeur>(BASE_URL, {
      method: "POST",
      data: form,
    });
  },

  // Mettre à jour une catégorie
  async update(data: CategorieActeur, id: number): Promise<CategorieActeur> {
    const { id_categorie, ...form } = data;
    console.log('data update', data);
    return await apiClient.request<CategorieActeur>(`${BASE_URL}${id}/`, {
      method: "PUT",
      data: form,
    });
  },

  // Supprimer une catégorie
  async delete(id: number): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: "DELETE",
    });
  }
};
