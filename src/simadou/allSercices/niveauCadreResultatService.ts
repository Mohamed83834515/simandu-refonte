import { apiClient } from '@/axios/api'
import type {
  NiveauCadreResultat,
  NiveauCadreResultatFormData,
} from '../allTypes'
import { normalizeApiList } from './apiListUtils'
const BASE_URL = '/niveaux-cadres-resultats/'
export const niveauCadreResultatService = {
  getAll: async (): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>('/niveaux-cadres-resultats/')
    const normalized = normalizeApiList<NiveauCadreResultat>(response)
    return [...normalized]
      .map((n) => ({ ...n, nombre_ncr: Number(n.nombre_ncr) }))
      .filter((n) => Number.isFinite(n.nombre_ncr))
      .sort((a, b) => a.nombre_ncr - b.nombre_ncr)
  },

  // Récupérer les niveaux par projet
  getByProjet: async (idProjet: number): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `${BASE_URL}?projet_ncr=${encodeURIComponent(idProjet)}`,
    );
    return normalizeApiList<NiveauCadreResultat>(response);
  },

  getById: async (id: number): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      `/niveaux-cadres-resultats/${id}/`
    )
  },

  getByType: async (type: 1 | 2 | 3): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/niveaux-cadres-resultats/?type_niveau=${type}`
    )
    return normalizeApiList<NiveauCadreResultat>(response)
  },

  search: async (query: string): Promise<NiveauCadreResultat[]> => {
    const response = await apiClient.request<unknown>(
      `/niveaux-cadres-resultats/?search=${encodeURIComponent(query)}`
    )
    return normalizeApiList<NiveauCadreResultat>(response)
  },

  create: async (
    data: NiveauCadreResultatFormData
  ): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      '/niveaux-cadres-resultats/',
      {
        method: 'POST',
        data,
      }
    )
  },

  update: async (
    id: number,
    data: Partial<NiveauCadreResultatFormData>
  ): Promise<NiveauCadreResultat> => {
    return await apiClient.request<NiveauCadreResultat>(
      `/niveaux-cadres-resultats/${id}/`,
      {
        method: 'PUT',
        data,
      }
    )
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.request(`/niveaux-cadres-resultats/${id}/`, {
      method: 'DELETE',
    })
  },
}
