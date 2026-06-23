import { apiClient } from '@/axios/api'
import { type Projet } from '../allTypes/projet'

const BASE_URL = '/projets/'

export const projetService = {
  // Récupérer tous les projets
  async getAll(): Promise<Projet[]> {
    return await apiClient.request<Projet[]>(BASE_URL)
  },

  // Récupérer tous les projets
  async getBudgetAnnuel(idProjet: number): Promise<{ annee: number; budget_annuel: number }[]> {
    return await apiClient.request<{ annee: number; budget_annuel: number }[]>(
      `${BASE_URL}${idProjet}/budgets-annuels/`
    )
  },

  // Récupérer un projet par ID
  async getById(id: number | string): Promise<Projet> {
    return await apiClient.request<Projet>(`${BASE_URL}${id}/`)
  },

  // Créer un nouveau projet
  async create(data: any): Promise<Projet> {
    return await apiClient.request<Projet>(BASE_URL, {
      method: 'POST',
      data,
    })
  },

  // Mettre à jour un projet
  async update(id: number | string, data: any): Promise<Projet> {
    return await apiClient.request<Projet>(`${BASE_URL}${id}/`, {
      method: 'PUT',
      data,
    })
  },

  // Supprimer un projet
  async delete(id: number | string): Promise<void> {
    await apiClient.request<void>(`${BASE_URL}${id}/`, {
      method: 'DELETE',
    })
  },
}
