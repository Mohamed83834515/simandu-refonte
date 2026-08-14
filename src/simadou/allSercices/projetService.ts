import { apiClient } from '@/axios/api'
import { ProjetClotureForm, type Projet } from '../allTypes/projet'

const BASE_URL = '/projets/'

export const projetService = {
  // Récupérer tous les projets
  async getAll(idProgramme: number): Promise<Projet[]> {
    return await apiClient.request<Projet[]>(`${BASE_URL}?programme_projet=${idProgramme}`)
  },

  async getAllWithfilter(idProgramme: number, idVersion: number): Promise<Projet[]> {
    return await apiClient.request<Projet[]>(`${BASE_URL}?programme_projet=${idProgramme}&ptbas_projet__version_ptba=${idVersion}`)
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
      method: "DELETE",
    });
  },

  async cloture(id: string | number, data: ProjetClotureForm): Promise<Projet> {
    return await apiClient.request<Projet>(`${BASE_URL}${id}/`, {
      method: "PATCH",
      data: data,
    });
  },
};
